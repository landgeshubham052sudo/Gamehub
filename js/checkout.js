// Checkout functionality

// Orders storage
let orders = [];

// Stripe elements variables
let stripe = null;
let elements = null;
let cardElement = null;

// PayPal order ID storage
let paypalOrderId = null;

// Initialize orders - fetch from API if user is logged in
async function initOrders() {
    if (currentUser) {
        try {
            const response = await fetch(`${window.API_URL || '/api'}/orders/user/${currentUser.id}`);
            if (response.ok) {
                orders = await response.json();
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    }
}

// Checkout function
function checkout() {
    console.log('[checkout] Checkout button clicked');
    console.log('[checkout] Cart items:', cart);
    console.log('[checkout] Current user:', currentUser);
    
    if (cart.length === 0) {
        console.log('[checkout] Cart is empty');
        showToast('Your cart is empty!');
        return;
    }
    
    // Check if user is logged in
    if (!currentUser) {
        console.log('[checkout] User not logged in, showing login');
        showToast('Please login to proceed to checkout!');
        toggleAuthModal('login');
        return;
    }
    
    console.log('[checkout] Proceeding to checkout');
    // Close cart modal and open checkout
    const cartModal = document.getElementById('cart-modal');
    if (cartModal && cartModal.classList.contains('show')) {
        console.log('[checkout] Closing cart modal');
        cartModal.classList.remove('show');
    }
    
    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) {
        console.log('[checkout] Opening checkout modal');
        checkoutModal.classList.add('show');
        resetCheckoutSteps();
        
        // Initialize payment config when checkout opens
        if (typeof loadPaymentConfig === 'function') {
            loadPaymentConfig();
        }
    } else {
        console.error('[checkout] Checkout modal not found!');
        showToast('Checkout modal not found!');
    }
}

// Toggle Checkout Modal
function toggleCheckout() {
    const modal = document.getElementById('checkout-modal');
    modal.classList.toggle('show');
    
    // Reset to first step if opening
    if (modal.classList.contains('show')) {
        resetCheckoutSteps();
    }
}

// Reset checkout steps
function resetCheckoutSteps() {
    document.getElementById('shipping-section').style.display = 'block';
    document.getElementById('payment-section').style.display = 'none';
    document.getElementById('confirm-section').style.display = 'none';
    document.getElementById('success-section').style.display = 'none';
    
    document.getElementById('step-shipping').classList.add('active');
    document.getElementById('step-payment').classList.remove('active');
    document.getElementById('step-confirm').classList.remove('active');
}

// Selected payment method storage
let selectedPaymentMethod = 'card';

// Go to payment step
function goToPayment(event) {
    event.preventDefault();
    
    document.getElementById('shipping-section').style.display = 'none';
    document.getElementById('payment-section').style.display = 'block';
    
    document.getElementById('step-shipping').classList.remove('active');
    document.getElementById('step-payment').classList.add('active');
    
    // Reset payment method to default
    selectedPaymentMethod = 'card';
    selectPaymentMethod('card');
    
    // Initialize Stripe Elements when entering payment step
    initStripeElements();
}

// Initialize Stripe Elements
function initStripeElements() {
    // Check if Stripe is loaded
    if (typeof Stripe === 'undefined') {
        console.log('[Stripe] Stripe.js not loaded yet');
        return;
    }
    
    // Initialize Stripe with publishable key
    const publishableKey = window.PAYMENT_CONFIG?.stripePublishableKey || 'pk_test_demo';
    if (publishableKey === 'pk_test_demo') {
        console.log('[Stripe] Using demo key - payments will not work');
        return;
    }
    
    if (!stripe) {
        stripe = Stripe(publishableKey);
    }
    
    const elements = stripe.elements();
    
    // Check if card element already exists
    let cardElementContainer = document.getElementById('card-element');
    if (!cardElementContainer) {
        // Create card element container
        cardElementContainer = document.createElement('div');
        cardElementContainer.id = 'card-element';
        cardElementContainer.className = 'stripe-card-element';
        
        const cardForm = document.getElementById('card-form');
        if (cardForm) {
            const existingCardElement = cardForm.querySelector('.stripe-card-element');
            if (existingCardElement) {
                existingCardElement.remove();
            }
            
            // Insert before the first form group
            const firstFormGroup = cardForm.querySelector('.form-group');
            if (firstFormGroup) {
                cardElementContainer.style.marginBottom = '15px';
                firstFormGroup.parentNode.insertBefore(cardElementContainer, firstFormGroup);
            }
        }
    }
    
    // Create or get the card element
    if (!cardElement) {
        cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#32325d',
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        });
        cardElement.mount('#card-element');
    }
}

// Select payment method
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Update UI - remove active class from all payment method cards
    const paymentCards = document.querySelectorAll('.payment-method-card');
    paymentCards.forEach(card => {
        card.classList.remove('active');
    });
    
    // Add active class to selected payment method card
    const selectedCard = document.querySelector(`.payment-method-card[data-method="${method}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
    }
    
    // Update radio button state
    const radioButtons = document.querySelectorAll('.payment-method-card input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.checked = false;
    });
    const selectedRadio = document.querySelector(`.payment-method-card[data-method="${method}"] input[type="radio"]`);
    if (selectedRadio) {
        selectedRadio.checked = true;
    }
    
    // Hide all payment form sections
    const formSections = document.querySelectorAll('.payment-form-section');
    formSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the selected payment form section
    const selectedForm = document.getElementById(`${method}-form`);
    if (selectedForm) {
        selectedForm.style.display = 'block';
    }
    
    // Initialize PayPal if selected
    if (method === 'paypal') {
        initPayPalButton();
    }
}

// Initialize PayPal Button
function initPayPalButton() {
    // Wait for PayPal SDK to load
    const checkPayPal = setInterval(() => {
        if (typeof paypal !== 'undefined') {
            clearInterval(checkPayPal);
            
            const paypalContainer = document.getElementById('paypal-button-container');
            if (!paypalContainer) return;
            
            // Clear previous button
            paypalContainer.innerHTML = '';
            
            // Calculate total
            const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
            const shipping = subtotal > 1000 ? 0 : 99;
            const tax = Math.round(subtotal * 0.1);
            const total = subtotal + shipping + tax;
            
            // Render PayPal button
            paypal.Buttons({
                style: {
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'paypal'
                },
                createOrder: function(data, actions) {
                    return fetch(`${window.API_URL || '/api'}/payment/paypal/create-order`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            amount: total * 100, // Convert to paise
                            currency: 'inr',
                            description: 'GameHub Order',
                            orderId: 'GH' + Date.now()
                        })
                    }).then(function(res) {
                        return res.json();
                    }).then(function(orderData) {
                        if (orderData.success) {
                            paypalOrderId = orderData.orderId;
                            return orderData.orderId;
                        } else {
                            throw new Error(orderData.error || 'Failed to create PayPal order');
                        }
                    });
                },
                onApprove: function(data, actions) {
                    return fetch(`${window.API_URL || '/api'}/payment/paypal/capture`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            paypalOrderId: data.orderID
                        })
                    }).then(function(res) {
                        return res.json();
                    }).then(function(captureData) {
                        if (captureData.success) {
                            showToast('Payment successful!');
                            // Proceed to create order
                            createOrderAfterPayment('paypal', captureData.transactionId);
                        } else {
                            showToast('Payment failed: ' + captureData.message);
                        }
                    });
                },
                onError: function(err) {
                    console.error('[PayPal] Error:', err);
                    showToast('PayPal payment error. Please try again.');
                }
            }).render('#paypal-button-container');
        }
    }, 500);
    
    // Timeout after 10 seconds
    setTimeout(() => {
        clearInterval(checkPayPal);
        console.log('[PayPal] SDK check timeout');
    }, 10000);
}

// Process Stripe payment
async function processStripePayment(total) {
    try {
        // Create payment intent
        const response = await fetch(`${window.API_URL || '/api'}/payment/stripe/create-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: total * 100, // Convert to paise
                currency: 'inr',
                description: 'GameHub Order',
                orderId: 'GH' + Date.now()
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to create payment intent');
        }
        
        // Confirm payment with Stripe
        const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: document.getElementById('shipping-name')?.value || 'Customer',
                    phone: document.getElementById('shipping-phone')?.value,
                    email: currentUser?.email
                }
            }
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        if (paymentIntent.status === 'succeeded') {
            return { success: true, transactionId: paymentIntent.id };
        } else {
            return { success: false, message: 'Payment not completed' };
        }
    } catch (error) {
        console.error('[Stripe] Payment error:', error);
        return { success: false, message: error.message };
    }
}

// Create order after successful payment
async function createOrderAfterPayment(paymentType, transactionId) {
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const shipping = subtotal > 1000 ? 0 : 99;
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + shipping + tax;
    
    // Get shipping info
    const shippingInfo = {
        name: document.getElementById('shipping-name')?.value,
        phone: document.getElementById('shipping-phone')?.value,
        address: document.getElementById('shipping-address')?.value,
        city: document.getElementById('shipping-city')?.value,
        zip: document.getElementById('shipping-zip')?.value,
        state: document.getElementById('shipping-state')?.value
    };
    
    try {
        const orderPayload = {
            userId: currentUser.id,
            items: cart,
            subtotal: subtotal,
            shipping: shipping,
            tax: tax,
            total: total,
            shippingInfo: shippingInfo,
            paymentMethod: selectedPaymentMethod,
            paymentType: paymentType,
            transactionId: transactionId,
            paymentStatus: 'completed'
        };
        
        const response = await fetch(`${window.API_URL || '/api'}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderPayload)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Clear cart
            cart = [];
            updateCartCount();
            
            // Show success
            document.getElementById('confirm-section').style.display = 'none';
            document.getElementById('success-section').style.display = 'block';
            document.getElementById('order-id').textContent = '#' + data.orderId;
            
            // Hide steps
            document.querySelector('.checkout-steps').style.display = 'none';
            
            showToast('Order placed successfully!');
            
            // Refresh orders
            await initOrders();
        } else {
            showToast(data.error || 'Failed to place order');
        }
    } catch (error) {
        console.error('[placeOrder] Exception:', error);
        showToast('Connection error. Please try again.');
    }
}

// Go back to shipping
function goBackToShipping() {
    document.getElementById('payment-section').style.display = 'none';
    document.getElementById('shipping-section').style.display = 'block';
    
    document.getElementById('step-payment').classList.remove('active');
    document.getElementById('step-shipping').classList.add('active');
}

// Go to confirm step
function goToConfirm(event) {
    event.preventDefault();
    
    // Populate order summary
    const orderSummary = document.getElementById('checkout-order-summary');
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const shipping = subtotal > 1000 ? 0 : 99;
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + shipping + tax;
    
    orderSummary.innerHTML = cart.map(item => `
        <div class="order-item">
            <div class="order-item-info">
                <h4>${item.name}</h4>
                <p>₹${item.price.toLocaleString()}</p>
            </div>
            <span class="order-item-qty">1</span>
            <span class="order-item-price">₹${item.price.toLocaleString()}</span>
        </div>
    `).join('');
    
    document.getElementById('checkout-subtotal').textContent = subtotal.toLocaleString();
    document.getElementById('checkout-shipping').textContent = shipping.toLocaleString();
    document.getElementById('checkout-tax').textContent = tax.toLocaleString();
    document.getElementById('checkout-total').textContent = total.toLocaleString();
    
    document.getElementById('payment-section').style.display = 'none';
    document.getElementById('confirm-section').style.display = 'block';
    
    document.getElementById('step-payment').classList.remove('active');
    document.getElementById('step-confirm').classList.add('active');
}

// Go back to payment
function goBackToPayment() {
    document.getElementById('confirm-section').style.display = 'none';
    document.getElementById('payment-section').style.display = 'block';
    
    document.getElementById('step-confirm').classList.remove('active');
    document.getElementById('step-payment').classList.add('active');
}

// Place Order
async function placeOrder() {
    console.log('[placeOrder] Starting order placement');
    console.log('[placeOrder] Current user:', currentUser);
    console.log('[placeOrder] Cart items:', cart);
    
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const shipping = subtotal > 1000 ? 0 : 99;
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + shipping + tax;
    
    console.log('[placeOrder] Totals - Subtotal:', subtotal, 'Shipping:', shipping, 'Tax:', tax, 'Total:', total);
    
    // Get shipping info
    const shippingInfo = {
        name: document.getElementById('shipping-name')?.value,
        phone: document.getElementById('shipping-phone')?.value,
        address: document.getElementById('shipping-address')?.value,
        city: document.getElementById('shipping-city')?.value,
        zip: document.getElementById('shipping-zip')?.value,
        state: document.getElementById('shipping-state')?.value
    };
    
    console.log('[placeOrder] Shipping info:', shippingInfo);
    console.log('[placeOrder] Selected payment method:', selectedPaymentMethod);
    console.log('[placeOrder] API URL:', window.API_URL || '/api');
    
    // For COD, no payment processing needed
    if (selectedPaymentMethod === 'cod') {
        try {
            const orderPayload = {
                userId: currentUser.id,
                items: cart,
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                total: total,
                shippingInfo: shippingInfo,
                paymentMethod: selectedPaymentMethod,
                paymentType: 'cod',
                paymentStatus: 'pending'
            };
            
            console.log('[placeOrder] Sending order payload:', orderPayload);
            
            const response = await fetch(`${window.API_URL || '/api'}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderPayload)
            });
            
            console.log('[placeOrder] Response status:', response.status);
            
            const data = await response.json();
            console.log('[placeOrder] Response data:', data);
            
            if (response.ok) {
                console.log('[placeOrder] Order created successfully - Order ID:', data.orderId);
                // Clear cart
                cart = [];
                updateCartCount();
                
                // Show success
                document.getElementById('confirm-section').style.display = 'none';
                document.getElementById('success-section').style.display = 'block';
                document.getElementById('order-id').textContent = '#' + data.orderId;
                
                // Hide steps
                document.querySelector('.checkout-steps').style.display = 'none';
                
                showToast('Order placed successfully!');
                
                // Refresh orders
                await initOrders();
            } else {
                console.error('[placeOrder] Order failed:', data.error);
                showToast(data.error || 'Failed to place order');
            }
        } catch (error) {
            console.error('[placeOrder] Exception:', error);
            console.error('[placeOrder] Error message:', error.message);
            console.error('[placeOrder] Error stack:', error.stack);
            showToast('Connection error. Please try again.');
        }
        return;
    }
    
    // For card payments, process with Stripe
    if (selectedPaymentMethod === 'card') {
        showToast('Processing payment...');
        
        const paymentResult = await processStripePayment(total);
        
        if (paymentResult.success) {
            showToast('Payment successful!');
            await createOrderAfterPayment('stripe', paymentResult.transactionId);
        } else {
            showToast('Payment failed: ' + paymentResult.message);
        }
        return;
    }
    
    // For other payment methods (UPI, Netbanking, Wallet), create order with pending payment
    // In a real app, you'd redirect to the payment gateway
    try {
        const orderPayload = {
            userId: currentUser.id,
            items: cart,
            subtotal: subtotal,
            shipping: shipping,
            tax: tax,
            total: total,
            shippingInfo: shippingInfo,
            paymentMethod: selectedPaymentMethod,
            paymentType: selectedPaymentMethod,
            paymentStatus: 'pending'
        };
        
        console.log('[placeOrder] Sending order payload:', orderPayload);
        
        const response = await fetch(`${window.API_URL || '/api'}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderPayload)
        });
        
        console.log('[placeOrder] Response status:', response.status);
        
        const data = await response.json();
        console.log('[placeOrder] Response data:', data);
        
        if (response.ok) {
            console.log('[placeOrder] Order created successfully - Order ID:', data.orderId);
            // Clear cart
            cart = [];
            updateCartCount();
            
            // Show success
            document.getElementById('confirm-section').style.display = 'none';
            document.getElementById('success-section').style.display = 'block';
            document.getElementById('order-id').textContent = '#' + data.orderId;
            
            // Hide steps
            document.querySelector('.checkout-steps').style.display = 'none';
            
            showToast('Order placed successfully! Payment pending.');
            
            // Refresh orders
            await initOrders();
        } else {
            console.error('[placeOrder] Order failed:', data.error);
            showToast(data.error || 'Failed to place order');
        }
    } catch (error) {
        console.error('[placeOrder] Exception:', error);
        console.error('[placeOrder] Error message:', error.message);
        console.error('[placeOrder] Error stack:', error.stack);
        showToast('Connection error. Please try again.');
    }
}

// Close checkout and reset
function closeCheckoutAndReset() {
    toggleCheckout();
    
    // Reset after animation
    setTimeout(() => {
        resetCheckoutSteps();
        document.querySelector('.checkout-steps').style.display = 'flex';
        
        // Clear forms
        document.querySelectorAll('#checkout-modal form').forEach(form => {
            form.reset();
        });
        
        // Reset PayPal
        paypalOrderId = null;
    }, 300);
}
