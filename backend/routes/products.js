const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all products
router.get('/', (req, res) => {
    db.query('SELECT DISTINCT * FROM products', (err, products) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(products);
    });
});

// Get product by ID
router.get('/:id', (req, res) => {
    db.query('SELECT * FROM products WHERE id = ?', [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(results[0]);
    });
});

// Get products by category
router.get('/category/:category', (req, res) => {
    db.query('SELECT * FROM products WHERE category = ?', [req.params.category], (err, products) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(products);
    });
});

// Add new product (admin)
router.post('/', (req, res) => {
    const { name, category, price, image, rating, description } = req.body;
    
    db.query(
        'INSERT INTO products (name, category, price, image, rating, description) VALUES (?, ?, ?, ?, ?, ?)',
        [name, category, price, image, rating, description],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            res.status(201).json({
                message: 'Product added successfully',
                productId: result.insertId
            });
        }
    );
});

// Update product
router.put('/:id', (req, res) => {
    const { name, category, price, image, rating, description } = req.body;
    
    db.query(
        'UPDATE products SET name = ?, category = ?, price = ?, image = ?, rating = ?, description = ? WHERE id = ?',
        [name, category, price, image, rating, description, req.params.id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            res.json({ message: 'Product updated successfully' });
        }
    );
});

// Delete product
router.delete('/:id', (req, res) => {
    db.query('DELETE FROM products WHERE id = ?', [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        res.json({ message: 'Product deleted successfully' });
    });
});

module.exports = router;