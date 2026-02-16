// Configuration for API URL
// Determines the correct API endpoint based on how the page is loaded



window.API_URL = 'http://localhost:3000/api';





// Payment Configuration
// These will be fetched from the server on init
window.PAYMENT_CONFIG = {
    stripePublishableKey: null,
    paypalClientId: null,
    currency: 'inr'
};

// Fetch payment configuration from server
async function loadPaymentConfig() {
    try {
        const response = await fetch(`${window.API_URL}/payment/config`);
        if (response.ok) {
            const config = await response.json();
            window.PAYMENT_CONFIG = {
                stripePublishableKey: config.stripePublishableKey,
                paypalClientId: config.paypalClientId,
                currency: config.currency
            };
            console.log('Payment config loaded:', window.PAYMENT_CONFIG);
            
            // Load Stripe.js dynamically if we have a publishable key
            if (window.PAYMENT_CONFIG.stripePublishableKey && 
                window.PAYMENT_CONFIG.stripePublishableKey !== 'pk_test_demo') {
                loadStripeScript();
            }
            
            // Load PayPal SDK dynamically if we have a client ID
            if (window.PAYMENT_CONFIG.paypalClientId && 
                window.PAYMENT_CONFIG.paypalClientId !== 'your_paypal_client_id') {
                loadPayPalScript();
            }
        }
    } catch (error) {
        console.error('Failed to load payment config:', error);
    }
}

// Load Stripe.js script dynamically
function loadStripeScript() {
    if (document.getElementById('stripe-js')) return;
    
    const script = document.createElement('script');
    script.id = 'stripe-js';
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => {
        console.log('Stripe.js loaded');
        // Initialize Stripe with publishable key
        if (window.PAYMENT_CONFIG.stripePublishableKey) {
            window.stripe = Stripe(window.PAYMENT_CONFIG.stripePublishableKey);
        }
    };
    document.head.appendChild(script);
}

// Load PayPal SDK script dynamically
function loadPayPalScript() {
    if (document.getElementById('paypal-sdk')) return;
    
    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${window.PAYMENT_CONFIG.paypalClientId}&currency=USD`;
    script.onload = () => {
        console.log('PayPal SDK loaded');
    };
    document.head.appendChild(script);
}

// Log for debugging
console.log('API_URL configured as:', window.API_URL);
console.log('Page protocol:', window.location.protocol);
