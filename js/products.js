// Render products to the DOM
function renderProducts(productsToRender) {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) {
        console.error('Product grid element not found!');
        return;
    }
    
    if (!productsToRender || productsToRender.length === 0) {
        productGrid.innerHTML = '<div class="no-products">No products found</div>';
        return;
    }
    
    productGrid.innerHTML = productsToRender.map(product => {
        // Check if in wishlist
        const inWishlist = typeof wishlist !== 'undefined' && wishlist.includes(product.id);
        const heartIcon = inWishlist ? 'fa-heart' : 'fa-heart-o';
        const heartClass = inWishlist ? 'active' : '';
        
        return `
            <div class="product-card ${product.category}" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <button class="wishlist-btn ${heartClass}" onclick="toggleWishlistItem(${product.id})">
                        <i class="fa ${heartIcon}"></i>
                    </button>
                    ${product.featured ? '<span class="featured-tag">Featured</span>' : ''}
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3>${product.name}</h3>
                    <div class="product-rating">
                        ${generateStars(product.rating)}
                        <span>(${product.rating})</span>
                    </div>
                    <p class="product-description">${product.description ? product.description.substring(0, 60) + '...' : ''}</p>
                    <div class="product-footer">
                        <div class="product-price">₹${product.price.toLocaleString()}</div>
                        <button class="add-to-cart-btn" onclick="addToCart('${product.name.replace(/'/g, "\\'")}', ${product.price}, ${product.id})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHtml = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fa fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHtml += '<i class="fa fa-star-half-o"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="fa fa-star-o"></i>';
    }
    
    return starsHtml;
}