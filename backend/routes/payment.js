const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_demo_key');

// PayPal SDK setup
const paypal = require('@paypal/checkout-server-sdk');

// PayPal environment setup
function getPayPalEnvironment() {
    const clientId = process.env.PAYPAL_CLIENT_ID || 'AQE5UUkpMVqAtMN2lCTF5---WwaX58lkYLWOjojdEPOodlEAQJg75Q9UZ-XdczO-_U1004d5kO6H7vDX';
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'ELwoEwxVMP6mAaGpMoQm51-A32PnlTCo70Q6Brmc622QmC6p0IzWKSwPzB6yoxRAr-zKjBLT6YQjuNK8';
    const mode = process.env.PAYPAL_MODE || 'sandbox';
    
    if (mode === 'sandbox') {
        return new paypal.core.SandboxEnvironment(clientId, clientSecret);
    }
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
}

function getPayPalClient() {
    const environment = getPayPalEnvironment();
    return new paypal.core.PayPalHttpClient(environment);
}

// Get Stripe publishable key
router.get('/config', (req, res) => {
    res.json({
        stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_demo',
        paypalClientId: process.env.PAYPAL_CLIENT_ID || 'your_paypal_client_id',
        currency: 'inr'
    });
});

// Process Stripe payment
router.post('/stripe/create-intent', async (req, res) => {
    try {
        console.log('[Payment] Creating Stripe payment intent');
        const { amount, currency, description, orderId } = req.body;

        console.log('[Payment] Amount:', amount, 'Currency:', currency);
        console.log('[Payment] Order ID:', orderId);
        
        // Validate amount
        if (!amount || amount < 100) {
            return res.status(400).json({ error: 'Invalid amount. Minimum is ₹100' });
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Stripe expects amount in paise
            currency: currency || 'inr',
            description: description || `Order #${orderId}`,
            metadata: { orderId: orderId }
        });

        console.log('[Payment] Payment Intent created:', paymentIntent.id);

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('[Payment] Stripe Error:', error.message);
        res.status(500).json({ 
            error: 'Payment processing failed: ' + error.message 
        });
    }
});

// Confirm Stripe payment
router.post('/stripe/confirm', async (req, res) => {
    try {
        console.log('[Payment] Confirming Stripe payment');
        const { paymentIntentId } = req.body;

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status === 'succeeded') {
            console.log('[Payment] Payment succeeded:', paymentIntentId);
            res.json({ 
                success: true, 
                message: 'Payment successful!',
                status: paymentIntent.status
            });
        } else if (paymentIntent.status === 'requires_action') {
            console.log('[Payment] Payment requires action (3D Secure):', paymentIntentId);
            res.json({
                success: false,
                message: 'Payment requires additional verification',
                status: paymentIntent.status,
                clientSecret: paymentIntent.client_secret
            });
        } else {
            console.log('[Payment] Payment failed:', paymentIntent.status);
            res.json({
                success: false,
                message: 'Payment failed: ' + paymentIntent.status,
                status: paymentIntent.status
            });
        }
    } catch (error) {
        console.error('[Payment] Error confirming payment:', error.message);
        res.status(500).json({ 
            error: 'Payment confirmation failed: ' + error.message 
        });
    }
});

// Process PayPal payment - Create Order
router.post('/paypal/create-order', async (req, res) => {
    try {
        console.log('[PayPal] Creating PayPal order');
        const { amount, currency, description, orderId } = req.body;

        console.log('[PayPal] Amount:', amount, 'Currency:', currency);
        console.log('[PayPal] Order ID:', orderId);
        
        // Validate amount
        if (!amount || amount < 100) {
            return res.status(400).json({ error: 'Invalid amount. Minimum is ₹100' });
        }

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                reference_id: orderId || 'DEFAULT_ORDER',
                description: description || 'GameHub Order',
                amount: {
                    currency_code: currency || 'USD',
                    value: (amount / 100).toFixed(2), // Convert from paise to dollars (approx)
                    breakdown: {
                        item_total: {
                            currency_code: currency || 'USD',
                            value: (amount / 100).toFixed(2)
                        }
                    }
                }
            }],
            application_context: {
                brand_name: 'GameHub',
                landing_page: 'NO_PREFERENCE',
                user_action: 'PAY_NOW',
                return_url: `${req.protocol}://${req.get('host')}/api/payment/paypal/success`,
                cancel_url: `${req.protocol}://${req.get('host')}/api/payment/paypal/cancel`
            }
        });

        const order = await getPayPalClient().execute(request);
        
        console.log('[PayPal] Order created:', order.result.id);

        // Find the approval URL
        const approvalUrl = order.result.links.find(link => link.rel === 'approve');
        
        res.json({
            success: true,
            orderId: order.result.id,
            approvalUrl: approvalUrl ? approvalUrl.href : null
        });
    } catch (error) {
        console.error('[PayPal] Error creating order:', error.message);
        res.status(500).json({ 
            error: 'PayPal order creation failed: ' + error.message 
        });
    }
});

// Capture PayPal payment
router.post('/paypal/capture', async (req, res) => {
    try {
        console.log('[PayPal] Capturing payment');
        const { paypalOrderId } = req.body;

        const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
        request.requestBody({});

        const capture = await getPayPalClient().execute(request);
        
        console.log('[PayPal] Payment captured:', capture.result.id);
        
        if (capture.result.status === 'COMPLETED') {
            res.json({
                success: true,
                message: 'Payment successful!',
                transactionId: capture.result.id,
                status: capture.result.status
            });
        } else {
            res.json({
                success: false,
                message: 'Payment not completed',
                status: capture.result.status
            });
        }
    } catch (error) {
        console.error('[PayPal] Error capturing payment:', error.message);
        res.status(500).json({ 
            error: 'PayPal payment capture failed: ' + error.message 
        });
    }
});

// Legacy endpoint - Process payment (supports both Stripe and PayPal)
router.post('/process', async (req, res) => {
    try {
        console.log('[Payment] Processing payment request');
        const { amount, currency, description, paymentMethodId, orderId, paymentType } = req.body;

        console.log('[Payment] Amount:', amount, 'Currency:', currency, 'PaymentType:', paymentType);
        console.log('[Payment] Order ID:', orderId);
        
        // Validate amount
        if (!amount || amount < 100) {
            return res.status(400).json({ error: 'Invalid amount. Minimum is ₹100' });
        }

        if (paymentType === 'paypal') {
            // Create PayPal order
            const request = new paypal.orders.OrdersCreateRequest();
            request.prefer('return=representation');
            request.requestBody({
                intent: 'CAPTURE',
                purchase_units: [{
                    reference_id: orderId || 'DEFAULT_ORDER',
                    description: description || 'GameHub Order',
                    amount: {
                        currency_code: currency || 'USD',
                        value: (amount / 100).toFixed(2)
                    }
                }],
                application_context: {
                    brand_name: 'GameHub',
                    user_action: 'PAY_NOW',
                    return_url: `${req.protocol}://${req.get('host')}/api/payment/paypal/success`,
                    cancel_url: `${req.protocol}://${req.get('host')}/api/payment/paypal/cancel`
                }
            });

            const order = await getPayPalClient().execute(request);
            const approvalUrl = order.result.links.find(link => link.rel === 'approve');
            
            res.json({
                success: true,
                paymentType: 'paypal',
                orderId: order.result.id,
                approvalUrl: approvalUrl ? approvalUrl.href : null
            });
        } else {
            // Default to Stripe
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount),
                currency: currency || 'inr',
                description: description || `Order #${orderId}`,
                metadata: { orderId: orderId }
            });

            console.log('[Payment] Payment Intent created:', paymentIntent.id);

            res.json({
                success: true,
                paymentType: 'stripe',
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            });
        }
    } catch (error) {
        console.error('[Payment] Error:', error.message);
        res.status(500).json({ 
            error: 'Payment processing failed: ' + error.message 
        });
    }
});

// Legacy confirm endpoint
router.post('/confirm', async (req, res) => {
    try {
        console.log('[Payment] Confirming payment');
        const { paymentIntentId, paymentType } = req.body;

        if (paymentType === 'paypal') {
            const request = new paypal.orders.OrdersCaptureRequest(paymentIntentId);
            request.requestBody({});
            const capture = await getPayPalClient().execute(request);
            
            if (capture.result.status === 'COMPLETED') {
                res.json({ 
                    success: true, 
                    message: 'Payment successful!',
                    transactionId: capture.result.id
                });
            } else {
                res.json({
                    success: false,
                    message: 'Payment not completed'
                });
            }
        } else {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            
            if (paymentIntent.status === 'succeeded') {
                res.json({ 
                    success: true, 
                    message: 'Payment successful!',
                    status: paymentIntent.status
                });
            } else {
                res.json({
                    success: false,
                    message: 'Payment failed: ' + paymentIntent.status,
                    status: paymentIntent.status
                });
            }
        }
    } catch (error) {
        console.error('[Payment] Error confirming payment:', error.message);
        res.status(500).json({ 
            error: 'Payment confirmation failed: ' + error.message 
        });
    }
});

module.exports = router;
