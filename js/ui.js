// UI functionality - Toast notifications, modals, forms

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Contact Form Handler
function handleContact(event) {
    event.preventDefault();
    showToast('Message sent successfully!');
    event.target.reset();
}

// Newsletter Handler
function handleNewsletter(event) {
    event.preventDefault();
    showToast('Successfully subscribed to newsletter!');
    event.target.reset();
}

// Close modals when clicking outside
function initModalClose() {
    window.onclick = function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.classList.remove('show');
            }
        });
    };
}
