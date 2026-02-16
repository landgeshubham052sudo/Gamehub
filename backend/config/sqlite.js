const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create/open database file in the project root
const dbPath = path.join(__dirname, '..', 'gamehub.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
        return;
    }
    console.log('Connected to SQLite database at', dbPath);
    initializeDatabase();
});

// Initialize database schema
function initializeDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Products table
        db.run(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                price REAL NOT NULL,
                image TEXT,
                rating REAL,
                description TEXT,
                featured INTEGER DEFAULT 0
            )
        `);

        // Orders table
        db.run(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                subtotal REAL NOT NULL,
                shipping REAL NOT NULL,
                tax REAL NOT NULL,
                total REAL NOT NULL,
                shipping_info TEXT,
                payment_method TEXT NOT NULL,
                status TEXT DEFAULT 'processing',
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Order items table
        db.run(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                product_name TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);

        // Check if products table is empty and insert sample products
        db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
            if (row && row.count === 0) {
                insertSampleProducts();
            }
        });
    });
}

// Insert sample products
function insertSampleProducts() {
    const products = [
        { name: 'Cyberpunk 2077', category: 'games', price: 2999, image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0f?w=400', rating: 4.5, description: 'An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.' },
        { name: 'The Last of Us Part II', category: 'games', price: 3499, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400', rating: 5, description: 'Experience the emotional story of Ellie and Joel in this critically acclaimed action-adventure game.' },
        { name: 'Spider-Man Miles Morales', category: 'games', price: 3999, image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400', rating: 4.8, description: 'Step into the shoes of Miles Morales and discover the story of a hero in training.' },
        { name: 'God of War Ragnarok', category: 'games', price: 4499, image: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=400', rating: 5, description: 'Join Kratos and Atreus on a mythic journey through Nine Realms in search of answers.' },
        { name: 'PlayStation 5', category: 'consoles', price: 49999, image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400', rating: 4.9, description: 'Experience lightning-fast loading, deeper immersion with haptic feedback, and a new generation of incredible games.' },
        { name: 'Xbox Series X', category: 'consoles', price: 49999, image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400', rating: 4.8, description: 'The fastest, most powerful Xbox ever. Experience true 4K gaming at up to 120 frames per second.' },
        { name: 'Nintendo Switch OLED', category: 'consoles', price: 34999, image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400', rating: 4.7, description: 'Featuring a vibrant 7-inch OLED screen, wide adjustable stand, and enhanced audio.' },
        { name: 'DualSense Controller', category: 'accessories', price: 6499, image: 'https://images.unsplash.com/photo-1592840496011-a5657518094c?w=400', rating: 4.6, description: 'Experience immersive haptic feedback and adaptive triggers in this next-gen controller.' },
        { name: 'Pro Controller Switch', category: 'accessories', price: 4999, image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400', rating: 4.5, description: 'Enhanced precision and control with this professional-grade Nintendo Switch controller.' },
        { name: 'Gaming Headset', category: 'accessories', price: 7999, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', rating: 4.4, description: 'Immersive 3D audio with noise-canceling microphone for crystal-clear communication.' },
        { name: 'Racing Wheel', category: 'accessories', price: 24999, image: 'https://images.unsplash.com/photo-1566008885218-90abf9200ddb?w=400', rating: 4.7, description: 'Professional-grade racing wheel with force feedback for the ultimate racing experience.' },
        { name: 'Gaming Monitor 144Hz', category: 'accessories', price: 19999, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400', rating: 4.6, description: '24-inch Full HD monitor with 144Hz refresh rate and 1ms response time.' }
    ];

    const stmt = db.prepare(`
        INSERT INTO products (name, category, price, image, rating, description, featured)
        VALUES (?, ?, ?, ?, ?, ?, 0)
    `);

    products.forEach(p => {
        stmt.run(p.name, p.category, p.price, p.image, p.rating, p.description);
    });

    stmt.finalize(() => {
        console.log('Sample products inserted successfully');
    });
}

// Create a MySQL-compatible wrapper for SQLite
// This provides a .query() method that works like MySQL's db.query()
const dbWrapper = {
    query: (sql, params, callback) => {
        // Handle cases where callback is passed directly as second argument
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }
        
        // Handle INSERT with multiple values (batch insert)
        // MySQL syntax: INSERT INTO table (col1, col2,...) VALUES ? where ? is replaced with data
        if (sql.includes('INSERT INTO') && sql.includes('VALUES')  && params && params.length > 0 && Array.isArray(params[0]) && Array.isArray(params[0][0])) {
            // This is a batch insert - convert to individual inserts
            const values = params[0]; // Array of value arrays
            
            // Extract the column list from SQL
            const colMatch = sql.match(/\(([^)]+)\)\s*VALUES/);
            if (colMatch) {
                const cols = colMatch[1].split(',').map(c => c.trim());
                const placeholders = cols.map(() => '?').join(', ');
                const insertSql = sql.replace(/VALUES\s*\?/, `VALUES (${placeholders})`);
                
                // Insert each row
                let insertedCount = 0;
                let hasError = false;
                
                if (values.length === 0) {
                    callback(null, { affectedRows: 0 });
                    return;
                }
                
                values.forEach((row, idx) => {
                    if (hasError) return;
                    
                    db.run(insertSql, row, function(err) {
                        if (err) {
                            if (!hasError) {
                                hasError = true;
                                callback(err, null);
                            }
                            return;
                        }
                        insertedCount++;
                        if (insertedCount === values.length) {
                            callback(null, { insertId: this.lastID, affectedRows: insertedCount });
                        }
                    });
                });
                return;
            }
        }
        
        // Handle SELECT queries
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
            if (params && params.length > 0) {
                db.all(sql, params, (err, rows) => {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, rows || []);
                    }
                });
            } else {
                db.all(sql, (err, rows) => {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, rows || []);
                    }
                });
            }
            return;
        }
        
        // Handle INSERT, UPDATE, DELETE queries
        if (sql.trim().toUpperCase().startsWith('INSERT') || 
            sql.trim().toUpperCase().startsWith('UPDATE') || 
            sql.trim().toUpperCase().startsWith('DELETE')) {
            
            if (params && params.length > 0) {
                db.run(sql, params, function(err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, { 
                            insertId: this.lastID, 
                            affectedRows: this.changes 
                        });
                    }
                });
            } else {
                db.run(sql, function(err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, { 
                            insertId: this.lastID, 
                            affectedRows: this.changes 
                        });
                    }
                });
            }
            return;
        }
        
        // Default fallback for other DML
        if (params && params.length > 0) {
            db.run(sql, params, function(err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, { changes: this.changes });
                }
            });
        } else {
            db.run(sql, function(err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, { changes: this.changes });
                }
            });
        }
    }
};

module.exports = dbWrapper;
