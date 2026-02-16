// Wishlist functionality

// Wishlist storage
let wishlist = [];

// Toggle Wishlist Modal
function toggleWishlist() {
    const modal = document.getElementById('wishlist-modal');
    modal.classList.toggle('show');
    renderWishlistItems();
}

// Toggle Wishlist Item
function toggleWishlistItem(productId) {
    const index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
        showToast('Removed from wishlist');
    } else {
        wishlist.push(productId);
        showToast('Added to wishlist!');
    }
    updateWishlistCount();
    renderProducts(products); // Re-render to update heart icon
}

// Update Wishlist Count
function updateWishlistCount() {
    const wishlistCount = document.getElementById('wishlist-count');
    if (wishlistCount) {
        wishlistCount.innerText = wishlist.length;
    }
}

// Render Wishlist Items
function renderWishlistItems() {
    const wishlistItems = document.getElementById('wishlist-items');
    if (!wishlistItems) return;
    
    if (wishlist.length === 0) {
        wishlistItems.innerHTML = '<p class="empty-wishlist">Your wishlist is empty</p>';
        return;
    }
    
    const wishlistProducts = products.filter(p => wishlist.includes(p.id));
    wishlistItems.innerHTML = wishlistProducts.map(product => `
        <div class="wishlist-item">
            <img src="${product.image}" alt="${product.name}">
            <div class="wishlist-item-info">
                <h4>${product.name}</h4>
                <p>₹${product.price.toLocaleString()}</p>
            </div>
            <div class="wishlist-item-actions">
                <button class="add-to-cart" onclick="addToCart('${product.name.replace(/'/g, "\'")}', ${product.price}, ${product.id})">Add to Cart</button>
                <button class="remove-wishlist" onclick="toggleWishlistItem(${product.id})">Remove</button>
            </div>
        </div>
    `).join('');
}
