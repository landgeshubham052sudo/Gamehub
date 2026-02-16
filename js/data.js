
// Product Data Array
let products = [];

// Fetch products from API
async function fetchProducts() {
    try {
        console.log('[fetchProducts] Starting product fetch...');
        console.log('[fetchProducts] API_URL:', window.API_URL);
        console.log('[fetchProducts] window.API_URL:', window.API_URL);
        console.log('[fetchProducts] window.location.href:', window.location.href);
        
        const url = `${window.API_URL}/products`;
        console.log('[fetchProducts] Final fetch URL:', url);
        
        const response = await fetch(url);
        console.log('[fetchProducts] Response object:', response);
        console.log('[fetchProducts] Response.status:', response.status);
        console.log('[fetchProducts] Response.statusText:', response.statusText);
        console.log('[fetchProducts] Response.ok:', response.ok);
        console.log('[fetchProducts] Response.headers:', response.headers);
        
        // Get response content type
        const contentType = response.headers.get('content-type');
        console.log('[fetchProducts] Content-Type:', contentType);
        
        // Clone response to read it multiple ways
        const responseText = await response.clone().text();
        console.log('[fetchProducts] Response text length:', responseText.length);
        console.log('[fetchProducts] Response text (first 200 chars):', responseText.substring(0, 200));
        
        if (response.ok) {
            try {
                const data = await response.json();
                console.log('[fetchProducts] JSON parsed successfully');
                console.log('[fetchProducts] Data type:', typeof data);
                console.log('[fetchProducts] Data is array:', Array.isArray(data));
                console.log('[fetchProducts] Data length:', data.length);
                console.log('[fetchProducts] First item:', data[0]);
                products = data;
                return products;
            } catch (parseError) {
                console.error('[fetchProducts] JSON parse error:', parseError);
                console.error('[fetchProducts] Parse error message:', parseError.message);
                return [];
            }
        } else {
            console.error('[fetchProducts] Response not OK, status:', response.status);
            const errorText = await response.text();
            console.error('[fetchProducts] Error response text:', errorText);
            return [];
        }
    } catch (error) {
        console.error('[fetchProducts] Exception occurred:', error);
        console.error('[fetchProducts] Error name:', error.name);
        console.error('[fetchProducts] Error message:', error.message);
        console.error('[fetchProducts] Error stack:', error.stack);
        return [];
    }
}
