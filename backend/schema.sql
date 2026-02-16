-- Create database
CREATE DATABASE IF NOT EXISTS gamehub;
USE gamehub;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
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

-- Orders table
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

-- Order items table
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

-- Insert sample products
INSERT INTO products (name, category, price, image, rating, description) VALUES
('Cyberpunk 2077', 'games', 2999, 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0f?w=400', 4.5, 'An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.'),
('The Last of Us Part II', 'games', 3499, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400', 5, 'Experience the emotional story of Ellie and Joel in this critically acclaimed action-adventure game.'),
('Spider-Man Miles Morales', 'games', 3999, 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400', 4.8, 'Step into the shoes of Miles Morales and discover the story of a hero in training.'),
('God of War Ragnarok', 'games', 4499, 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=400', 5, 'Join Kratos and Atreus on a mythic journey through Nine Realms in search of answers.'),
('PlayStation 5', 'consoles', 49999, 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400', 4.9, 'Experience lightning-fast loading, deeper immersion with haptic feedback, and a new generation of incredible games.'),
('Xbox Series X', 'consoles', 49999, 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400', 4.8, 'The fastest, most powerful Xbox ever. Experience true 4K gaming at up to 120 frames per second.'),
('Nintendo Switch OLED', 'consoles', 34999, 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400', 4.7, 'Featuring a vibrant 7-inch OLED screen, wide adjustable stand, and enhanced audio.'),
('DualSense Controller', 'accessories', 6499, 'https://images.unsplash.com/photo-1592840496011-a5657518094c?w=400', 4.6, 'Experience immersive haptic feedback and adaptive triggers in this next-gen controller.'),
('Pro Controller Switch', 'accessories', 4999, 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400', 4.5, 'Enhanced precision and control with this professional-grade Nintendo Switch controller.'),
('Gaming Headset', 'accessories', 7999, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 4.4, 'Immersive 3D audio with noise-canceling microphone for crystal-clear communication.'),
('Racing Wheel', 'accessories', 24999, 'https://images.unsplash.com/photo-1566008885218-90abf9200ddb?w=400', 4.7, 'Professional-grade racing wheel with force feedback for the ultimate racing experience.'),
('Gaming Monitor 144Hz', 'accessories', 19999, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400', 4.6, '24-inch Full HD monitor with 144Hz refresh rate and 1ms response time.');
