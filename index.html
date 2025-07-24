import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './index.css';

// --- CONFIGURATION ---
const PROFIT_MARGIN_PERCENTAGE = 50;
const STRIPE_PUBLISHABLE_KEY = ""; // <-- PASTE YOUR STRIPE PUBLISHABLE KEY (pk_...)
const API_URL = ''; // For production, this will be a relative path, which is correct.

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

const PRICING_DATA = {
    bookSize: { '0600X0900': { basePrice: 3.00 } },
    bookType: { 'PB': { priceModifier: 1.50 }, 'HC': { priceModifier: 6.50 }, 'EBOOK': { priceModifier: 0 } },
    coverFinish: { 'G': { priceModifier: 0 }, 'M': { priceModifier: 1.50 } },
    interiorPrint: { 'BW': { pricePerPage: 0.02 }, 'FC': { pricePerPage: 0.07 } },
    paperType: { '060CW': { priceModifier: 0 }, '080CW': { priceModifier: 2.00 } },
    shipping: { 'standard': { price: 4.99 }, 'express': { price: 10.99 } }
};

// --- Reusable UI Components ---
const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800">{title}</h2>
        {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
    </div>
);

const FormField = ({ id, label, placeholder, value, onChange, type = 'text', rows = 4 }) => (
    <div>
        <label htmlFor={id} className="block text-md font-semibold text-gray-700 mb-2">{label}</label>
        {type === 'textarea' ? (
            <textarea id={id} value={value} onChange={onChange} rows={rows} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" placeholder={placeholder} />
        ) : (
            <input type={type} id={id} value={value} onChange={onChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" placeholder={placeholder} />
        )}
    </div>
);

const OptionCard = ({ group, value, title, subtitle, selectedValue, onSelect }) => (
    <div 
        onClick={() => onSelect(group, value)} 
        className={`option-card p-4 rounded-lg text-center border-2 transition-all duration-200 cursor-pointer h-full flex flex-col justify-center ${selectedValue === value ? 'selected' : 'border-gray-200'}`}
    >
        <h4 className="font-bold text-gray-800">{title}</h4>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
);

const CheckoutForm = ({ onPaymentSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/success`,
            },
            redirect: 'if_required'
        });

        if (error) {
            setErrorMessage(error.message);
            setIsProcessing(false);
        } else {
            setErrorMessage('');
            onPaymentSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <button type="submit" disabled={isProcessing || !stripe} className="btn-primary text-lg w-full mt-8">
                {isProcessing ? "Processing..." : "Pay & Place Order"}
            </button>
            {errorMessage && <div className="text-red-600 text-sm mt-2 text-center">{errorMessage}</div>}
        </form>
    )
};


function App() {
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        bookTitle: '', recipientName: '', genre: '', coverImage: null, promptText: '',
        bookSize: '', bookType: '', coverFinish: '', interiorPrint: '', paperType: '', pageRange: '',
        shipping: '', shippingName: '', shippingEmail: ''
    });

    const [story, setStory] = useState('');
    const [uiState, setUiState] = useState('form');
    const [cart, setCart] = useState({ subtotal: 0, shipping: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [clientSecret, setClientSecret] = useState('');

    // --- EVENT HANDLERS & LOGIC ---
    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    const handleOptionSelect = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, coverImage: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleStoryGeneration = async () => {
        setIsLoading(true);
        
        const formDataForApi = new FormData();
        Object.keys(formData).forEach(key => {
            formDataForApi.append(key, formData[key]);
        });

        try {
            const response = await fetch(`${API_URL}/api/story/generate`, {
                method: 'POST',
                body: formDataForApi
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'An unknown error occurred.');
            
            setStory(data.story);
            setUiState('preview');
        } catch (error) {
            alert(`Could not generate story: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalizeOrder = async () => {
        setUiState('finalize');
        if (cart.total > 0) {
            try {
                const response = await fetch(`${API_URL}/api/payment/create-payment-intent`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ totalAmount: Math.round(cart.total * 100) })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);
                setClientSecret(data.clientSecret);
            } catch (error) {
                alert(`Could not initialize payment: ${error.message}`);
            }
        }
    };
    
    const onPaymentSuccess = async () => {
        const luluData = {
             line_items: [{
                pod_package_id: [
                    formData.bookSize, formData.interiorPrint, "STD",
                    formData.bookType, formData.paperType + "444",
                    formData.coverFinish, "X", "X"
                ].join('')
            }],
        };

        try {
            await fetch(`${API_URL}/api/order/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shippingDetails: { name: formData.shippingName, email: formData.shippingEmail },
                    luluDataBloc: luluData
                })
            });
            setUiState('confirmation');
        } catch (error) {
            alert(`Payment succeeded, but failed to create final order: ${error.message}`);
        }
    };

    useEffect(() => {
        let baseCost = 0;
        const pageCount = parseInt(formData.pageRange) || 0;
        
        baseCost += PRICING_DATA.bookSize[formData.bookSize]?.basePrice || 0;
        baseCost += PRICING_DATA.bookType[formData.bookType]?.priceModifier || 0;
        baseCost += PRICING_DATA.coverFinish[formData.coverFinish]?.priceModifier || 0;
        baseCost += PRICING_DATA.paperType[formData.paperType]?.priceModifier || 0;
        baseCost += pageCount * (PRICING_DATA.interiorPrint[formData.interiorPrint]?.pricePerPage || 0);

        let shippingPrice = PRICING_DATA.shipping[formData.shipping]?.price || 0;
        if (formData.bookType === 'EBOOK') shippingPrice = 0;

        const profit = baseCost * (PROFIT_MARGIN_PERCENTAGE / 100);
        const subtotal = baseCost + profit;
        const total = subtotal + shippingPrice;
        
        setCart({ subtotal, shipping: shippingPrice, total });
    }, [formData]);

    return (
        <div className="antialiased bg-gray-50">
            <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-4xl font-bold font-serif text-gray-800">Inkwell AI</h1>
                    <a href="#create" className="btn-primary text-sm hidden md:inline-block">Create Your Book</a>
                </div>
            </header>

            <section className="hero-bg text-white py-24 sm:py-32">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-5xl md:text-7xl font-bold font-serif leading-tight mb-4">A Story Only You Can Tell.</h2>
                    <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto font-light">Transform your ideas into a beautifully written, custom-printed book.</p>
                    <a href="#create" className="btn-primary text-lg">Start Your Story</a>
                </div>
            </section>

            <main id="create" className="py-24">
                <div className="container mx-auto px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-3 gap-12">
                            
                            <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
                                {uiState === 'form' && (
                                    <form className="space-y-10">
                                        <SectionHeader title="Create Your Book" subtitle="Fill in the details below to bring your story to life." />
                                        <div className="mt-8 text-center">
                                            <button type="button" onClick={handleStoryGeneration} disabled={isLoading} className="btn-primary text-lg w-full md:w-auto">
                                                {isLoading ? 'Weaving...' : 'Weave My Tale!'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                                {uiState === 'preview' && (
                                     <div>
                                        <SectionHeader title="Your Story is Ready!" subtitle="Review the generated text and make any edits you like." />
                                        <div contentEditable onBlur={e => setStory(e.currentTarget.innerText)} className="p-6 bg-gray-50 rounded-lg border prose max-w-none focus:ring-2 focus:ring-amber-500" dangerouslySetInnerHTML={{ __html: story.replace(/\n/g, '<br />') }}></div>
                                        <div className="mt-8 text-center">
                                            <button type="button" onClick={handleFinalizeOrder} className="btn-primary text-lg">Looks Good, Finalize Order &rarr;</button>
                                        </div>
                                    </div>
                                )}
                                {uiState === 'finalize' && (
                                     <div>
                                        <SectionHeader title="Finalize Your Order" />
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div>
                                                <h4 className="text-lg font-semibold mb-4">Shipping Details</h4>
                                                <div className="space-y-4">
                                                    <FormField id="shippingName" label="Full Name" placeholder="Jane Doe" value={formData.shippingName} onChange={handleInputChange} />
                                                    <FormField id="shippingEmail" label="Email for Confirmations" placeholder="jane.doe@example.com" value={formData.shippingEmail} onChange={handleInputChange} />
                                                </div>
                                                <h4 className="text-lg font-semibold mb-4 mt-6">Payment</h4>
                                                {clientSecret && stripePromise && (
                                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                                        <CheckoutForm onPaymentSuccess={onPaymentSuccess} />
                                                    </Elements>
                                                )}
                                            </div>
                                            <div className="bg-teal-50/50 p-6 rounded-lg">
                                                <h4 className="text-lg font-semibold mb-4 border-b pb-2">Shopping Cart</h4>
                                                <div className="space-y-2 text-gray-700">
                                                    <div className="flex justify-between"><span>Subtotal:</span><span>${cart.subtotal.toFixed(2)}</span></div>
                                                    <div className="flex justify-between"><span>Shipping:</span><span>${cart.shipping.toFixed(2)}</span></div>
                                                    <div className="flex justify-between font-bold text-xl pt-2 border-t mt-2"><span>Total:</span><span>${cart.total.toFixed(2)}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {uiState === 'confirmation' && (
                                    <div className="text-center py-10">
                                        <svg className="mx-auto h-24 w-24 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <h3 className="text-3xl font-bold font-serif mt-6 mb-2">Thank You!</h3>
                                        <p className="text-gray-600 mb-4">Your order has been placed successfully.</p>
                                        <button type="button" onClick={() => window.location.reload()} className="btn-primary mt-8">Create Another Book</button>
                                    </div>
                                )}
                            </div>

                            <div className="lg:col-span-1 space-y-8">
                                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                                     <label className="block text-lg font-semibold text-gray-700 mb-2">Your Cover</label>
                                    <div id="image-preview-container" onClick={() => document.getElementById('coverImage').click()} className="w-full h-80 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-center p-4 relative cursor-pointer">
                                        {imagePreview ? <img src={imagePreview} alt="Cover preview" className="max-h-full max-w-full rounded-lg" /> : <div id="image-placeholder" className="text-gray-500"><span>Click to upload</span></div>}
                                    </div>
                                    <input type="file" id="coverImage" onChange={handleImageChange} className="hidden" accept="image/*" />
                                </div>
                                <div id="cart-container" className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 sticky top-28">
                                    <h3 className="text-3xl font-bold font-serif text-gray-800 mb-4 border-b pb-2">Shopping Cart</h3>
                                    <div className="space-y-2 text-gray-700">
                                        <div className="flex justify-between"><span>Subtotal:</span><span id="summary-subtotal">${cart.subtotal.toFixed(2)}</span></div>
                                        <div className="flex justify-between"><span>Shipping:</span><span id="summary-shipping">${cart.shipping.toFixed(2)}</span></div>
                                        <div className="flex justify-between font-bold text-xl pt-2 border-t mt-2"><span>Total:</span><span id="summary-total">${cart.total.toFixed(2)}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

const AppWrapper = () => {
    if (!STRIPE_PUBLISHABLE_KEY) {
        return <App />;
    }
    return (
        <Elements stripe={stripePromise}>
            <App />
        </Elements>
    );
};

export default AppWrapper;
