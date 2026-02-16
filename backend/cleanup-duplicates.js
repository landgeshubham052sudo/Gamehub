const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '2006',
    database: 'gamehub'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log('Connected to gamehub database');
    
    // Check for duplicate products
    connection.query('SELECT name, COUNT(*) as count FROM products GROUP BY name HAVING count > 1', (err, duplicates) => {
        if (err) {
            console.error('Error checking duplicates:', err.message);
            connection.end();
            return;
        }
        
        if (duplicates.length === 0) {
            console.log('✓ No duplicate products found.');
            connection.end();
            return;
        }
        
        console.log(`Found ${duplicates.length} products with duplicates:`);
        duplicates.forEach(dup => {
            console.log(`  - ${dup.name} (${dup.count} occurrences)`);
        });
        
        // Remove duplicates by keeping only the first occurrence of each product
        const deleteQuery = `
            DELETE p1 FROM products p1
            INNER JOIN products p2 
            WHERE p1.id > p2.id 
            AND p1.name = p2.name
        `;
        
        connection.query(deleteQuery, (err, result) => {
            if (err) {
                console.error('Error removing duplicates:', err.message);
                connection.end();
                return;
            }
            
            console.log(`✓ Successfully removed ${result.affectedRows} duplicate product records.`);
            
            // Verify the cleanup
            connection.query('SELECT COUNT(*) as total FROM products', (err, result) => {
                if (err) {
                    console.error('Error verifying cleanup:', err.message);
                } else {
                    console.log(`✓ Total products in database: ${result[0].total}`);
                }
                connection.end();
            });
        });
    });
});
