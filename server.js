// Inkwell AI - Final Production Backend
// This server handles file uploads, story generation, payment processing, and order creation.

// --- Dependencies ---
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const multer = require('multer'); 
const path = require('path');
const fs = require('fs');
require('dotenv').config(); 

// --- Initialize Express App ---
const app = express();
const PORT = process.env.PORT || 3001;

// --- File Upload Setup (Multer) ---
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- Stripe Setup ---
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// --- Middleware ---
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- Serve the Frontend File ---
// This tells the server to serve the built React app from the 'client/dist' folder
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));


// --- API Routes ---

app.post('/api/story/generate', upload.single('coverImage'), async (req, res) => {
    try {
        const { title, genre, promptText, pageRange } = req.body;
        const coverImageFile = req.file;

        if (!title || !genre || !promptText || !coverImageFile || !pageRange) {
            return res.status(400).json({ error: 'A required field is missing.' });
        }

        const fullPrompt = `You are a master storyteller. Write a compelling short story in the ${genre} genre, titled "${title}". The story should be approximately ${pageRange} long. Base the story on these user-provided details: --- ${promptText} --- The story must be well-structured with a clear beginning, middle, and a satisfying end.`;
        
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
        console.error('Error in /api/story/generate:', error);
        res.status(500).json({ error: 'Failed to generate story.' });
    }
});

app.post('/api/payment/create-payment-intent', async (req, res) => {
    try {
        const { totalAmount } = req.body;

        if (!totalAmount || totalAmount < 50) {
            return res.status(400).json({ error: 'Invalid order amount.' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
        });

        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({ error: 'Failed to create payment intent.' });
    }
});

app.post('/api/order/create', (req, res) => {
    try {
        const { shippingDetails, luluDataBloc } = req.body;

        console.log('\x1b[32m%s\x1b[0m', '--- ✅ NEW ORDER RECEIVED ---');
        console.log('Date:', new Date().toISOString());
        console.log('Shipping To:', shippingDetails);
        console.log('Lulu Print Job Data:', luluDataBloc);
        console.log('\x1b[32m%s\x1b[0m', '--- END OF ORDER ---');
        
        const simulatedOrderId = `INK-${Date.now()}`;
        res.json({ success: true, orderId: simulatedOrderId });

    } catch (error) {
        console.error('Final Order Error:', error);
        res.status(500).json({ error: 'Failed to process the final order.' });
    }
});

// Catch-all to serve the React app for any other request
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});


// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
