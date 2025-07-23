// Inkwell AI - Final Production Backend
// This server handles file uploads, story generation, payment processing, and order creation.

// --- Dependencies ---
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const multer = require('multer'); // Middleware for handling file uploads
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Loads .env file variables

// --- Initialize Express App ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- File Upload Setup (Multer) ---
// Create an 'uploads' directory on the server if it doesn't exist.
// This is where cover images will be stored temporarily.
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Configure how files are stored.
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Create a unique filename to prevent files with the same name from overwriting each other.
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- Stripe Setup ---
// Your Stripe secret key is loaded securely from the .env file.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// --- Middleware ---
app.use(cors()); // Allows your frontend to talk to your backend
app.use(express.json()); // To parse JSON data in request bodies
app.use(express.urlencoded({ extended: true })); // To parse form data

// --- API Routes ---

/**
 * @route   POST /api/create-draft
 * @desc    Receives text prompts AND the cover image file, then generates a story.
 * @access  Public
 */
app.post('/api/create-draft', upload.single('coverImage'), async (req, res) => {
    try {
        const { title, genre, promptText } = req.body;
        const coverImageFile = req.file; // The uploaded file object from multer

        if (!title || !genre || !promptText || !coverImageFile) {
            return res.status(400).json({ error: 'A required field is missing. Please fill out the title, genre, prompt, and upload a cover image.' });
        }

        console.log(`Draft creation started. Cover image saved as: ${coverImageFile.filename}`);

        const fullPrompt = `
            You are a master storyteller. Write a compelling short story in the ${genre} genre, titled "${title}".
            Base the story on these user-provided details:
            ---
            ${promptText}
            ---
            The story must be well-structured with a clear beginning, middle, and a satisfying end. Aim for a word count between 500 and 700 words.
        `;
        
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: fullPrompt }] }] })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Gemini API request failed: ${errorBody}`);
        }

        const data = await response.json();
        const storyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Our AI storyteller is dreaming. Please try again in a moment.";

        res.json({ story: storyText, coverImageFilename: coverImageFile.filename });

    } catch (error) {
        console.error('Error in /api/create-draft:', error);
        res.status(500).json({ error: 'Failed to create story draft.' });
    }
});


/**
 * @route   POST /api/create-payment-intent
 * @desc    Creates a secure payment session with Stripe.
 * @access  Public
 */
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { bookType, shippingType } = req.body;

        const prices = {
            book: { paperback: 2999, hardcover: 4299 }, // Prices in cents
            shipping: { standard: 499, express: 1099 }
        };

        const totalAmount = (prices.book[bookType] || 0) + (prices.shipping[shippingType] || 0);

        if (totalAmount === 0) {
            return res.status(400).json({ error: 'Invalid order options selected.' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'usd',
            automatic_payment_methods: { enabled: true }, // This automatically enables cards, PayPal, etc.
        });

        res.send({ clientSecret: paymentIntent.client_secret, totalAmount });
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({ error: 'Failed to create payment intent.' });
    }
});


/**
 * @route   POST /api/create-final-order
 * @desc    This is the final step after successful payment. It logs the complete order.
 * @access  Public
 */
app.post('/api/create-final-order', (req, res) => {
    try {
        const { shippingDetails, bookTitle, bookType, coverImageFilename, storyText } = req.body;

        // --- THIS IS YOUR "NEW ORDER" NOTIFICATION ---
        // For your launch tonight, this will print a complete order summary to your server's logs.
        // You can check these logs in your Render dashboard to get all the info you need to fulfill the order.
        console.log('\x1b[32m%s\x1b[0m', '--- ✅ NEW ORDER RECEIVED ---');
        console.log('Date:', new Date().toISOString());
        console.log('Book Title:', bookTitle);
        console.log('Book Type:', bookType);
        console.log('Shipping To:', shippingDetails);
        console.log('Cover Image Filename:', coverImageFilename); // This file is in the 'uploads' folder on your server
        console.log('--- Story Text Snippet ---');
        console.log(storyText.substring(0, 400) + '...');
        console.log('\x1b[32m%s\x1b[0m', '--- END OF ORDER ---');
        
        // This is where you would call the Lulu/Printify API for full automation later.
        // For now, the log above is your "order fulfillment" system.

        const simulatedOrderId = `INK-${Date.now()}`;
        res.json({ success: true, orderId: simulatedOrderId });

    } catch (error) {
        console.error('Final Order Error:', error);
        res.status(500).json({ error: 'Failed to process the final order.' });
    }
});

// --- Static File Server ---
// This tells the server to serve the frontend files from a 'public' folder.
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Inkwell AI server is live and running on http://localhost:${PORT}`);
});
