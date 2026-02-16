# MySQL Workbench Connection Guide for GameHub

##  Current Setup Status
- **MySQL Server:** Running 
- **MySQL Workbench:** Installed & Running 
- **Database:** gamehub (Connected)
- **Products:** 12 loaded 
- **Backend:** Using MySQL (Updated)

---

## Quick Connection Steps

Since MySQL is already installed and running, just connect:

1. **Launch MySQL Workbench**
   - Open from Start Menu or Applications

2. **Select Connection**
   - Click on "GameHub Local" or create new connection
   - **Hostname:** localhost
   - **Port:** 3306
   - **Username:** root
   - **Password:** 2006

3. **Connected!** Browse gamehub database in left panel

---

## Database Tables

| Table | Purpose | Records |
|-------|---------|---------|
| products | Gaming items (games, consoles, accessories) | 12 |
| users | Player accounts | Auto-created |
| orders | Customer purchases | Auto-created |
| order_items | Items in each order | Auto-created |

---

## Quick SQL Queries

### See All Products
SELECT id, name, category, price FROM products;

### See Users & Orders
SELECT u.username, COUNT(o.id) as orders, SUM(o.total) as spent
FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;

### Check Orders
SELECT o.id, u.username, o.total, o.status, o.date FROM orders o
JOIN users u ON o.user_id = u.id ORDER BY o.date DESC;

---

## Connection Details

- **Host:** localhost
- **Port:** 3306
- **User:** root
- **Password:** 2006
- **Database:** gamehub

---

## Backend Integration

Your Node.js backend (backend/server.js) is configured to use this MySQL database.

File: backend/.env

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=2006
DB_NAME=gamehub
PORT=3000

---

## Next Steps

1. Open MySQL Workbench and connect
2. Run SQL queries to browse data
3. Start backend: cd backend && node server.js
4. Open http://localhost:3000

---

**Status:**  MySQL Connected & Ready
