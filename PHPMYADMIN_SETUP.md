# phpMyAdmin Setup Guide for GameHub

This guide will help you set up phpMyAdmin to manage your MySQL database.

## Option 1: Using XAMPP (Recommended for Windows)

XAMPP is the easiest way to get phpMyAdmin running on Windows. It includes Apache, PHP, MySQL, and phpMyAdmin all in one package.

### Step 1: Download XAMPP
1. Go to: https://www.apachefriends.org/download.html
2. Download XAMPP for Windows (latest version)
3. Run the installer (choose default settings)

### Step 2: Start Apache and MySQL
1. After installation, open XAMPP Control Panel
2. Click "Start" next to Apache
3. Click "Start" next to MySQL
4. Both should show green indicating they're running

### Step 3: Access phpMyAdmin
1. Open your browser
2. Go to: http://localhost/phpmyadmin
3. Login with:
   - Username: `root`
   - Password: `2006` (or leave blank if not set)

### Step 4: Connect to Your Existing Database
Your GameHub backend uses MySQL with these credentials:
- Host: `localhost`
- Port: `3306` (default)
- Username: `root`
- Password: `2006`
- Database: `gamehub`

In phpMyAdmin:
1. Click "New" to create a new database
2. Database name: `gamehub`
3. Collation: `utf8mb4_general_ci`
4. Click "Create"

Or if your database already exists on a MySQL server:
1. Click "Import" in phpMyAdmin
2. Import your existing database schema

## Option 2: Using Your Existing MySQL with Standalone phpMyAdmin

If you already have MySQL running and just want phpMyAdmin:

### Step 1: Download phpMyAdmin
1. Go to: https://www.phpmyadmin.net/downloads/
2. Download the latest version
3. Extract to a folder (e.g., `C:\phpMyAdmin`)

### Step 2: Configure phpMyAdmin
1. Copy `config.sample.inc.php` to `config.inc.php`
2. Edit `config.inc.php` and set:
```
php
$cfg['Servers'][$i]['host'] = 'localhost';
$cfg['Servers'][$i]['user'] = 'root';
$cfg['Servers'][$i]['password'] = '2006';
```

### Step 3: Run with PHP Built-in Server
1. Make sure PHP is installed
2. Open command prompt in the phpMyAdmin folder
3. Run: `php -S localhost:8080`
4. Open browser to http://localhost:8080

## Option 3: Using Docker

If you have Docker installed:

```
bash
docker run -d \
  --name phpmyadmin \
  -p 8080:80 \
  -e PMA_HOST=localhost \
  -e PMA_USER=root \
  -e PMA_PASSWORD=2006 \
  phpmyadmin/phpmyadmin
```

Then access at http://localhost:8080

## Using phpMyAdmin with GameHub

Once phpMyAdmin is running, you can:

1. **Browse your database**: Click on `gamehub` database to see tables
2. **View data**: Click on any table (users, products, orders, order_items)
3. **Add products**: Go to products table → Click "Insert"
4. **Edit orders**: Go to orders table → Click on any order to edit
5. **Manage users**: Go to users table to view/edit users

## Database Tables Reference

Your GameHub database has these tables:

- **users**: Customer accounts (id, username, email, password, created_at)
- **products**: Game products (id, name, category, price, image, rating, description, featured)
- **orders**: Customer orders (id, user_id, subtotal, shipping, tax, total, shipping_info, payment_method, status, date)
- **order_items**: Items in each order (id, order_id, product_id, product_name, quantity, price)

## Troubleshooting

### Can't connect to MySQL
- Make sure MySQL service is running
- Check username and password
- Verify MySQL is running on correct port (3306)

### Access denied error
- Check that MySQL user has proper permissions
- Try resetting root password in MySQL

### Database not found
- Create the database first in phpMyAdmin
- Run your backend to auto-create tables
