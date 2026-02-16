const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '2006'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log('Connected to MySQL server');
    
    // Create database
    connection.query('CREATE DATABASE IF NOT EXISTS gamehub', (err) => {
        if (err) {
            console.error('Error creating database:', err.message);
            return;
        }
        console.log('Database "gamehub" created or already exists');
        
        // Use the database
        connection.query('USE gamehub', (err) => {
            if (err) {
                console.error('Error selecting database:', err.message);
                return;
            }
            
            // Create users table
            connection.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creating users table:', err.message);
                else console.log('Users table created');
            });
            
            // Create products table
            connection.query(`
                CREATE TABLE IF NOT EXISTS products (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    price DECIMAL(10, 2) NOT NULL,
                    image TEXT,
                    rating DECIMAL(3, 1),
                    description TEXT,
                    featured TINYINT(1) DEFAULT 0
                )
            `, (err) => {
                if (err) console.error('Error creating products table:', err.message);
                else console.log('Products table created');
            });
            
            // Create orders table
            connection.query(`
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
                )
            `, (err) => {
                if (err) console.error('Error creating orders table:', err.message);
                else console.log('Orders table created');
            });
            
            // Create order_items table
            connection.query(`
                CREATE TABLE IF NOT EXISTS order_items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id INT NOT NULL,
                    product_id INT NOT NULL,
                    product_name VARCHAR(255) NOT NULL,
                    quantity INT NOT NULL,
                    price DECIMAL(10, 2) NOT NULL,
                    FOREIGN KEY (order_id) REFERENCES orders(id),
                    FOREIGN KEY (product_id) REFERENCES products(id)
                )
            `, (err) => {
                if (err) console.error('Error creating order_items table:', err.message);
                else console.log('Order items table created');
            });
            
            // Insert sample products
            const products = [
                { name: 'Cyberpunk 2077', category: 'games', price: 2999, image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0f?w=400', rating: 4.5, description: 'An open-world, action-adventure story set in Night City.' },
                { name: 'The Last of Us Part II', category: 'games', price: 3499, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400', rating: 5, description: 'Experience the emotional story of Ellie and Joel.' },
                { name: 'Spider-Man Miles Morales', category: 'games', price: 3999, image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400', rating: 4.8, description: 'Step into the shoes of Miles Morales.' },
                { name: 'God of War Ragnarok', category: 'games', price: 4499, image: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=400', rating: 5, description: 'Join Kratos and Atreus on a mythic journey.' },
                { name: 'PlayStation 5', category: 'consoles', price: 49999, image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400', rating: 4.9, description: 'Experience lightning-fast loading with PlayStation 5.' },
                { name: 'Xbox Series X', category: 'consoles', price: 49999, image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400', rating: 4.8, description: 'The fastest, most powerful Xbox ever.' },
                { name: 'Nintendo Switch OLED', category: 'consoles', price: 34999, image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400', rating: 4.7, description: 'Featuring a vibrant 7-inch OLED screen.' },
                { name: 'DualSense Controller', category: 'accessories', price: 6499, image: 'https://images.unsplash.com/photo-1592840496011-a5657518094c?w=400', rating: 4.6, description: 'Experience immersive haptic feedback.' },
                { name: 'Pro Controller Switch', category: 'accessories', price: 4999, image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400', rating: 4.5, description: 'Enhanced precision and control.' },
                { name: 'Gaming Headset', category: 'accessories', price: 7999, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', rating: 4.4, description: 'Immersive 3D audio with noise-canceling microphone.' },
                { name: 'Racing Wheel', category: 'accessories', price: 24999, image: 'https://images.unsplash.com/photo-1566008885218-90abf9200ddb?w=400', rating: 4.7, description: 'Professional-grade racing wheel with force feedback.' },
                { name: 'Gaming Monitor 144Hz', category: 'accessories', price: 19999, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400', rating: 4.6, description: '24-inch Full HD monitor with 144Hz refresh rate.' }
            ];
            
            // Check if products exist first
            connection.query('SELECT COUNT(*) as count FROM products', (err, result) => {
                if (err || result[0].count === 0) {
                    // Use proper parameterized query for each product
                    const insertQuery = 'INSERT INTO products (name, category, price, image, rating, description) VALUES (?, ?, ?, ?, ?, ?)';
                    
                    // Insert products one by one using proper parameterized queries
                    let insertedCount = 0;
                    products.forEach(p => {
                        connection.query(insertQuery, [p.name, p.category, p.price, p.image, p.rating, p.description], (err) => {
                            if (err) {
                                console.error('Error inserting product:', p.name, err.message);
                            }
                            insertedCount++;
                            if (insertedCount === products.length) {
                                console.log('Sample products inserted');
                                console.log('\nDatabase setup complete! You can now start the server.');
                                connection.end();
                            }
                        });
                    });
                } else {
                    console.log('Products already exist, skipping insert');
                    console.log('\nDatabase setup complete! You can now start the server.');
                    connection.end();
                }
            });
        });
    });
});
