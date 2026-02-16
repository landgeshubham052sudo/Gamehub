# GameHub System Architecture

## How Everything Connects

```
┌─────────────────────────────────────────────────────────────┐
│                    GAMEHUB SYSTEM DIAGRAM                    │
└─────────────────────────────────────────────────────────────┘

                           BROWSER
                             │
                    http://localhost:3000
                             │
                ┌────────────▼────────────┐
                │   Frontend (index.html)  │
                │  - HTML/CSS/JavaScript   │
                │  - Cart, Checkout, etc   │
                └────────────┬────────────┘
                             │
                      API Calls (JSON)
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   /api/products      /api/auth         /api/orders
   /api/payment      /api/checkout      /api/users
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                ┌────────────▼────────────┐
                │   Express.js Backend    │
                │   Node.js Server        │
                │   (port 3000)           │
                └────────────┬────────────┘
                             │
                   MySQL Query Protocol
                             │
        ┌────────────────────▼────────────────────┐
        │      MySQL Server (localhost:3306)      │
        │  ┌──────────────────────────────────┐   │
        │  │    gamehub Database              │   │
        │  │  ┌─────────────────────────────┐ │   │
        │  │  │ products (12 items)         │ │   │
        │  │  │ users (accounts)            │ │   │
        │  │  │ orders (history)            │ │   │
        │  │  │ order_items (line items)    │ │   │
        │  │  └─────────────────────────────┘ │   │
        │  └──────────────────────────────────┘   │
        └──────────────────────────────────────────┘
                             ▲
                             │
                    SQL Queries / Results
                             │
              ┌──────────────▼──────────────┐
              │   MySQL Workbench (GUI)     │
              │  - Browse data              │
              │  - Run queries              │
              │  - Edit records             │
              │  - Monitor database         │
              └─────────────────────────────┘
              
```

---

## Data Flow Examples

### Example 1: Loading Products on Page Load

```
1. Browser loads http://localhost:3000
2. Frontend JavaScript calls GET /api/products
3. Express Backend queries MySQL: SELECT * FROM products
4. MySQL returns 12 product records
5. Frontend receives JSON response
6. Products render on page with images, prices, ratings
```

### Example 2: User Places an Order

```
1. User clicks "Place Order" button
2. Frontend sends POST /api/orders with cart items
3. Express Backend:
   - Creates order record in orders table
   - Creates order_items records for each product
   - Updates user record with order history
4. MySQL saves all data
5. Frontend receives confirmation
6. MySQL Workbench shows new order (real-time)
```

### Example 3: View Orders in MySQL Workbench

```
1. Open MySQL Workbench
2. Connect to gamehub database
3. Right-click orders table → Select Rows
4. See all customer orders with full details
5. Can edit, delete, or export data
6. Changes appear in API immediately
```

---

## File Structure

```
GameHub/
├── index.html                 ← Main web page
├── style.css                  ← Styling
├── js/                        ← Frontend code
│   ├── app.js                 ← Main app init
│   ├── products.js            ← Product rendering
│   ├── cart.js                ← Cart functionality
│   ├── checkout.js            ← Checkout flow
│   ├── auth.js                ← Login/Register
│   └── ...
├── backend/                   ← Node.js Server
│   ├── server.js              ← Main server file
│   ├── config/
│   │   └── db.js              ← MySQL connection ✅
│   ├── routes/
│   │   ├── products.js        ← GET /api/products
│   │   ├── auth.js            ← POST /api/auth
│   │   ├── orders.js          ← POST/GET /api/orders
│   │   └── payment.js         ← Payment integrations
│   ├── package.json
│   └── .env                   ← DB credentials ✅
└── [guides]
    ├── MYSQL_SETUP_COMPLETE.md (you are here)
    ├── MYSQL_WORKBENCH_SETUP.md
    ├── MIGRATION_SQLITE_TO_MYSQL.md
    └── TEST_REPORT.md
```

---

## Connection Details

### MySQL Connection
```
Application → Express Server → MySQL Connector → MySQL Server
   Port 3000      Port 3000                      Port 3306
```

### Configuration in backend/.env
```
DB_HOST=localhost       (MySQL server location)
DB_USER=root            (Database user)
DB_PASSWORD=2006        (Database password)
DB_NAME=gamehub         (Database name)
PORT=3000               (Express server port)
```

### MySQL Tables Structure
```
products
├─ id (primary key)
├─ name
├─ category
├─ price
├─ image
├─ rating
├─ description
└─ featured

users
├─ id (primary key)
├─ username
├─ email
├─ password (hashed)
└─ created_at

orders
├─ id (primary key)
├─ user_id (foreign key → users)
├─ subtotal
├─ shipping
├─ tax
├─ total
├─ shipping_info (JSON)
├─ payment_method
├─ status
└─ date

order_items
├─ id (primary key)
├─ order_id (foreign key → orders)
├─ product_id (foreign key → products)
├─ product_name
├─ quantity
└─ price
```

---

## API Routes

### Products Routes
```
GET /api/products              Get all products
GET /api/products/:id          Get one product
GET /api/products/category/:cat  Get by category
POST /api/products             Add product (admin)
PUT /api/products/:id          Update product (admin)
DELETE /api/products/:id       Delete product (admin)
```

### Auth Routes
```
POST /api/auth/register        Create new user
POST /api/auth/login           Login user
GET /api/auth/logout           Logout user
```

### Orders Routes
```
GET /api/orders/user/:userId   Get user's orders
GET /api/orders/:id            Get order details
POST /api/orders               Create order
PUT /api/orders/:id/status     Update order status
DELETE /api/orders/:id         Cancel order
```

### Payment Routes
```
GET /api/payment/config        Get payment config
POST /api/payment/stripe       Process Stripe payment
POST /api/payment/paypal       Process PayPal payment
```

---

## Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)
- Font Awesome Icons

### Backend
- Node.js
- Express.js
- MySQL2 (Node MySQL driver)
- Stripe API
- PayPal API

### Database
- MySQL Server
- MySQL Workbench (GUI)

---

## How to Use Each Component

### 1. Browser (Frontend)
```
- Navigate to http://localhost:3000
- View products
- Add to cart
- Checkout
- Login/Register
- View orders
```

### 2. Express Server (Backend)
```
- Receives HTTP requests from frontend
- Queries MySQL database
- Returns JSON responses
- Handles payments
- Manages authentication
```

### 3. MySQL Database
```
- Stores all application data
- Processes SQL queries
- Maintains relationships
- Auto-creates on server startup
```

### 4. MySQL Workbench
```
- Browse database structure
- View/edit data
- Run custom queries
- Monitor performance
- Create backups
- Manage users
```

---

## Data Flow in REST API

```
CLIENT REQUEST
    ↓
POST /api/orders
{
  userId: 7,
  items: [{id: 1, price: 2999}],
  total: 3699
}
    ↓
EXPRESS BACKEND
- Parse JSON
- Validate data
- Prepare SQL
    ↓
MYSQL SERVER
INSERT INTO orders (user_id, total, ...) VALUES (...)
INSERT INTO order_items (...) VALUES (...)
    ↓
DATABASE
- Write to tables
- Return success
    ↓
EXPRESS
- Build response
- Send JSON back
    ↓
CLIENT
Receive {orderId: 38, message: "Order created"}
    ↓
DISPLAY
Show confirmation to user
```

---

## Verification Checklist

- ✅ MySQL running on port 3306
- ✅ MySQL Workbench connected
- ✅ Database gamehub created
- ✅ 4 tables created (products, users, orders, order_items)
- ✅ 12 sample products inserted
- ✅ Express server on port 3000
- ✅ API endpoints responding
- ✅ Database queries working
- ✅ Frontend loading correctly

---

## Performance Tips

### For MySQL Workbench
- Use indexes on frequently searched columns
- Monitor query execution time
- Create backups regularly
- Archive old orders periodically

### For API
- Use pagination for large datasets
- Cache product lists
- Connection pooling for multiple requests
- Query optimization

### For Frontend
- Lazy load images
- Minimize JavaScript
- Use compression
- Cache static files

---

## Security Considerations

⚠️ **Before Production:**
1. Change MySQL root password
2. Create limited user for app
3. Use environment variables for secrets
4. Enable SSL for HTTPS
5. Implement rate limiting
6. Validate all inputs
7. Use prepared statements (already done)
8. Regular backups

---

**Architecture Version:** 1.0  
**Last Updated:** February 16, 2026  
**Status:** ✅ Fully Integrated
