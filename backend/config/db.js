const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gamehub'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err.message);
        console.error('Make sure MySQL is running');
        process.exit(1);
    }
    console.log('✓ Connected to MySQL database: gamehub');
    console.log(`✓ Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`✓ Database: ${process.env.DB_NAME || 'gamehub'}`);
    
    // Initialize database schema and data on connection
    initializeDatabase();
});

function initializeDatabase() {
    // Create tables if they don't exist
    const createTablesSQL = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(50) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            image TEXT,
            rating DECIMAL(3, 1),
            description TEXT,
            featured TINYINT(1) DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            subtotal DECIMAL(10, 2) NOT NULL,
            shipping DECIMAL(10, 2) NOT NULL,
            tax DECIMAL(10, 2) NOT NULL,
            total DECIMAL(10, 2) NOT NULL,
            shipping_info JSON,
            payment_method VARCHAR(50) NOT NULL,
            status VARCHAR(50) DEFAULT 'processing',
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            product_name VARCHAR(255) NOT NULL,
            quantity INT NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        );
    `;

    // Create tables
    const statements = createTablesSQL.split(';').filter(s => s.trim());
    let completed = 0;

    statements.forEach((statement, index) => {
        if (statement.trim()) {
            db.query(statement, (err) => {
                if (err && !err.message.includes('already exists')) {
                    console.error(`Error creating table ${index}:`, err.message);
                }
                completed++;
                
                // After all tables are created, check if products exist
                if (completed === statements.length) {
                    checkAndInsertProducts();
                }
            });
        }
    });
}

function checkAndInsertProducts() {
    db.query('SELECT COUNT(*) as count FROM products', (err, results) => {
        if (err) {
            console.error('Error checking products:', err.message);
            return;
        }

        if (results[0].count === 0) {
            console.log('✓ Inserting sample products...');
            insertSampleProducts();
        } else {
            console.log(`✓ Database ready - ${results[0].count} products found`);
        }
    });
}

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

    let inserted = 0;
    products.forEach(product => {
        db.query(
            'INSERT INTO products (name, category, price, image, rating, description) VALUES (?, ?, ?, ?, ?, ?)',
            [product.name, product.category, product.price, product.image, product.rating, product.description],
            (err) => {
                if (err) {
                    console.error('Error inserting product:', product.name, err.message);
                } else {
                    inserted++;
                    if (inserted === products.length) {
                        console.log(`✓ All ${products.length} sample products inserted successfully`);
                    }
                }
            }
        );
    });
}

module.exports = db;
