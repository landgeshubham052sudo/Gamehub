// Cart functionality

// Cart storage
let cart = [];

// Add to Cart
function addToCart(name, price, id) {
    cart.push({id, name, price});
    updateCartCount();
    showToast('Item added to cart!');
    
    // Update button temporarily
    event.target.innerText = "Added!";
    event.target.style.background = "#ffffff";
    setTimeout(() => {
        event.target.innerText = "Add to Cart";
        event.target.style.background = "#00ff00";
    }, 1000);
}

// Update Cart Count
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.innerText = cart.length;
    }
}

// Toggle Cart Modal
function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.classList.toggle('show');
    renderCartItems();
}

// Render Cart Items
function renderCartItems() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems || !cartTotal) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.innerText = '0';
        return;
    }
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>₹${item.price.toLocaleString()}</p>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">
                <i class="fa fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotal.innerText = total.toLocaleString();
}

// Remove from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    renderCartItems();
}

// Get Cart Total
function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price, 0);
}

// Clear Cart
function clearCart() {
    cart = [];
    updateCartCount();
}
