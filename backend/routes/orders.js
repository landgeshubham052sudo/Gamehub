const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get orders by user ID
router.get('/user/:userId', (req, res) => {
    db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY date DESC', [req.params.userId], (err, orders) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(orders || []);
    });
});

// Get single order by ID
router.get('/:id', (req, res) => {
    db.query('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, orderResult) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (orderResult.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const order = orderResult[0];
        
        // Get order items
        db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id], (err, items) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            order.items = items || [];
            res.json(order);
        });
    });
});

// Create new order
router.post('/', (req, res) => {
    const { userId, items, subtotal, shipping, tax, total, shippingInfo, paymentMethod } = req.body;
    
    const shippingInfoJSON = JSON.stringify(shippingInfo);
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    db.query(
        'INSERT INTO orders (user_id, subtotal, shipping, tax, total, shipping_info, payment_method, status, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, subtotal, shipping, tax, total, shippingInfoJSON, paymentMethod, 'processing', date],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            const orderId = result.insertId;
            
            if (!items || items.length === 0) {
                return res.status(201).json({
                    message: 'Order created successfully',
                    orderId: orderId
                });
            }
            
            const itemValues = items.map(item => [orderId, item.id, item.name, 1, item.price]);
            
            db.query(
                'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES ?',
                [itemValues],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    
                    res.status(201).json({
                        message: 'Order created successfully',
                        orderId: orderId
                    });
                }
            );
        }
    );
});

// Update order status
router.put('/:id/status', (req, res) => {
    const { status } = req.body;
    
    db.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, req.params.id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            res.json({ message: 'Order status updated successfully' });
        }
    );
});

module.exports = router;