
// Product Data Array
let products = [];

// Sample products for fallback when API is unavailable
const SAMPLE_PRODUCTS = [
    {
        id: 1,
        name: 'Cyberpunk 2077',
        category: 'games',
        price: 2999,
        image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0f?w=400',
        rating: 4.5,
        description: 'An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.',
        featured: 1
    },
    {
        id: 2,
        name: 'The Last of Us Part II',
        category: 'games',
        price: 3499,
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
        rating: 5,
        description: 'Experience the emotional story of Ellie and Joel in this critically acclaimed action-adventure game.',
        featured: 1
    },
    {
        id: 3,
        name: 'Spider-Man Miles Morales',
        category: 'games',
        price: 3999,
        image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400',
        rating: 4.8,
        description: 'Step into the shoes of Miles Morales and discover the story of a hero in training.',
        featured: 1
    },
    {
        id: 4,
        name: 'God of War Ragnarok',
        category: 'games',
        price: 4499,
        image: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=400',
        rating: 5,
        description: 'Join Kratos and Atreus on a mythic journey through Nine Realms in search of answers.',
        featured: 1
    },
    {
        id: 5,
        name: 'PlayStation 5',
        category: 'consoles',
        price: 49999,
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
        rating: 4.9,
        description: 'Experience lightning-fast loading, deeper immersion with haptic feedback, and a new generation of incredible games.',
        featured: 1
    },
    {
        id: 6,
        name: 'Xbox Series X',
        category: 'consoles',
        price: 49999,
        image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400',
        rating: 4.8,
        description: 'The fastest, most powerful Xbox ever. Experience true 4K gaming at up to 120 frames per second.',
        featured: 1
    },
    {
        id: 7,
        name: 'Nintendo Switch OLED',
        category: 'consoles',
        price: 34999,
        image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400',
        rating: 4.7,
        description: 'Featuring a vibrant 7-inch OLED screen, wide adjustable stand, and enhanced audio.',
        featured: 0
    },
    {
        id: 8,
        name: 'DualSense Controller',
        category: 'accessories',
        price: 6499,
        image: 'https://images.unsplash.com/photo-1592840496011-a5657518094c?w=400',
        rating: 4.6,
        description: 'Experience immersive haptic feedback and adaptive triggers in this next-gen controller.',
        featured: 0
    },
    {
        id: 9,
        name: 'Pro Controller Switch',
        category: 'accessories',
        price: 4999,
        image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400',
        rating: 4.5,
        description: 'Enhanced precision and control with this professional-grade Nintendo Switch controller.',
        featured: 0
    },
    {
        id: 10,
        name: 'Gaming Headset',
        category: 'accessories',
        price: 7999,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        rating: 4.4,
        description: 'Immersive 3D audio with noise-canceling microphone for crystal-clear communication.',
        featured: 0
    },
    {
        id: 11,
        name: 'Racing Wheel',
        category: 'accessories',
        price: 24999,
        image: 'https://images.unsplash.com/photo-1566008885218-90abf9200ddb?w=400',
        rating: 4.7,
        description: 'Professional-grade racing wheel with force feedback for the ultimate racing experience.',
        featured: 0
    },
    {
        id: 12,
        name: 'Gaming Monitor 144Hz',
        category: 'accessories',
        price: 19999,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
        rating: 4.6,
        description: '24-inch Full HD monitor with 144Hz refresh rate and 1ms response time.',
        featured: 0
    }
];

// Fetch products from API
async function fetchProducts() {
    try {
        console.log('[fetchProducts] Starting product fetch...');
        console.log('[fetchProducts] API_URL:', window.API_URL);
        
        const url = `${window.API_URL}/products`;
        console.log('[fetchProducts] Final fetch URL:', url);
        
        // Set a timeout for the fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        console.log('[fetchProducts] Response status:', response.status);
        
        if (response.ok) {
            try {
                const data = await response.json();
                console.log('[fetchProducts] Successfully loaded', data.length, 'products from API');
                products = data;
                return products;
            } catch (parseError) {
                console.error('[fetchProducts] JSON parse error:', parseError.message);
                console.log('[fetchProducts] Using fallback sample products');
                products = SAMPLE_PRODUCTS;
                return products;
            }
        } else {
            console.error('[fetchProducts] API error:', response.status);
            console.log('[fetchProducts] Using fallback sample products');
            products = SAMPLE_PRODUCTS;
            return products;
        }
    } catch (error) {
        console.error('[fetchProducts] Error fetching products:', error.message);
        console.log('[fetchProducts] Using fallback sample products');
        products = SAMPLE_PRODUCTS;
        return products;
    }
}
