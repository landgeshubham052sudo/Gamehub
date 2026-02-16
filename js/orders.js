// Orders functionality

// View Orders
function viewOrders() {
    const ordersList = document.getElementById('orders-list');
    
    // Filter orders for current user
    const userOrders = orders.filter(o => o.userId === currentUser.id);
    
    if (userOrders.length === 0) {
        ordersList.innerHTML = '<p class="empty-orders">You haven\'t placed any orders yet.</p>';
    } else {
        ordersList.innerHTML = userOrders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">#${order.id}</span>
                    <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
                    <span class="order-status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                </div>
                <div class="order-items-list">
                    ${order.items.map(item => `
                        <p class="order-item-name">${item.name}</p>
                    `).join('')}
                </div>
                <div class="order-footer">
                    <span class="order-total-label">Total</span>
                    <span class="order-total-amount">₹${order.total.toLocaleString()}</span>
                </div>
            </div>
        `).join('');
    }
    
    // Close user menu
    document.getElementById('user-dropdown-content').classList.remove('show');
    
    // Open orders modal
    document.getElementById('orders-modal').classList.add('show');
}

// Toggle Orders Modal
function toggleOrdersModal() {
    const modal = document.getElementById('orders-modal');
    modal.classList.toggle('show');
}
