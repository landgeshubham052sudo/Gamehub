// Main initialization file - ties all modules together

// Initialize the application on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('=== GameHub Initialization Started ===');
        
        // Debug: Check if functions are defined
        console.log('Checking function definitions...');
        console.log('initAuth:', typeof initAuth);
        console.log('initOrders:', typeof initOrders);
        console.log('initSearch:', typeof initSearch);
        console.log('initUserMenuClose:', typeof initUserMenuClose);
        console.log('initModalClose:', typeof initModalClose);
        console.log('fetchProducts:', typeof fetchProducts);
        console.log('renderProducts:', typeof renderProducts);
        console.log('window.API_URL:', window.API_URL);
        

        
        // Initialize core features
        if (typeof initAuth === 'function') {
            console.log('[app] Calling initAuth()');
            initAuth();
        }
        if (typeof initOrders === 'function') {
            console.log('[app] Calling initOrders()');
            initOrders();
        }
        if (typeof initSearch === 'function') {
            console.log('[app] Calling initSearch()');
            initSearch();
        }
        if (typeof initUserMenuClose === 'function') {
            console.log('[app] Calling initUserMenuClose()');
            initUserMenuClose();
        }
        if (typeof initModalClose === 'function') {
            console.log('[app] Calling initModalClose()');
            initModalClose();
        }
        
        // Fetch and render products
        console.log('[app] Fetching products from API...');
        const fetchedProducts = await fetchProducts();
        console.log('[app] API Response:', fetchedProducts);
        console.log('[app] API Response length:', fetchedProducts ? fetchedProducts.length : 'null');
        
        if (fetchedProducts && fetchedProducts.length > 0) {
            console.log('[app] Products found, rendering...');
            renderProducts(fetchedProducts);
            console.log('Products rendered successfully! Count:', fetchedProducts.length);
            // Update section title with count
            const sectionTitle = document.querySelector('.section-title');
            if (sectionTitle) {
                sectionTitle.textContent = `Featured Products (${fetchedProducts.length} items)`;
            }
        } else {
            console.error('[app] No products found or failed to fetch products!');
            console.error('[app] Make sure the backend server is running on http://localhost:3000');
            console.error('[app] Make sure the database is initialized');
            const productGrid = document.getElementById('product-grid');
            if (productGrid) {
                productGrid.innerHTML = '<p style="text-align:center;padding:20px;">Unable to load products. Please refresh the page.<br><small>Check console for details</small></p>';
            }
        }
        
        console.log('GameHub initialized successfully!');
    } catch (error) {
        console.error('Error during initialization:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        alert('Error during initialization: ' + error.message);
    }
});

