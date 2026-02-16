// Authentication functionality

// User data storage
let currentUser = null;
let users = [];

// Initialize authentication on page load
function initAuth() {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('gamehub_currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateUIForLoggedInUser();
    }
}

// Toggle Auth Modal
function toggleAuthModal(type) {
    console.log('[toggleAuthModal] Called with type:', type);
    const modalId = type + '-modal';
    const modal = document.getElementById(modalId);
    console.log('[toggleAuthModal] Looking for element with id:', modalId);
    console.log('[toggleAuthModal] Element found:', !!modal);
    
    if (!modal) {
        console.error('[toggleAuthModal] Modal not found!');
        return;
    }
    
    // Check if the modal is already open
    if (modal.classList.contains('show')) {
        console.log('[toggleAuthModal] Modal is open, closing it');
        // If already open, just close it
        modal.classList.remove('show');
    } else {
        console.log('[toggleAuthModal] Modal is closed, opening it');
        // Close all auth modals first
        document.querySelectorAll('#login-modal, #register-modal, #forgot-modal').forEach(m => {
            console.log('[toggleAuthModal] Closing modal:', m.id);
            m.classList.remove('show');
        });
        
        // Open the requested modal
        modal.classList.add('show');
        console.log('[toggleAuthModal] Modal classes now:', modal.className);
    }
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    console.log('Login form submitted');
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    console.log('Login attempt for:', email);
    console.log('API_URL:', window.API_URL || '/api');
    
    if (!email || !password) {
        console.warn('Email or password is empty');
        showToast('Please enter both email and password!');
        return;
    }
    
    try {
        console.log('Sending login request to:', `${window.API_URL || '/api'}/auth/login`);
        const response = await fetch(`${window.API_URL || '/api'}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log('Login response status:', response.status);
        const data = await response.json();
        console.log('Login response data:', data);
        
        if (response.ok) {
            console.log('Login successful for user:', data.user.username);
            currentUser = data.user;
            
            if (rememberMe) {
                localStorage.setItem('gamehub_currentUser', JSON.stringify(data.user));
                console.log('User saved to localStorage');
            } else {
                sessionStorage.setItem('gamehub_currentUser', JSON.stringify(data.user));
                console.log('User saved to sessionStorage');
            }
            
            console.log('Updating UI for logged in user');
            if (typeof updateUIForLoggedInUser === 'function') {
                updateUIForLoggedInUser();
            } else {
                console.error('updateUIForLoggedInUser is not a function!');
            }
            
            console.log('Closing login modal');
            toggleAuthModal('login');
            
            console.log('Showing success toast');
            if (typeof showToast === 'function') {
                showToast('Welcome back, ' + data.user.username + '!');
            } else {
                console.error('showToast is not a function!');
                alert('Welcome back, ' + data.user.username + '!');
            }
            
            // Clear form
            event.target.reset();
            console.log('Login completed successfully');
        } else {
            console.error('Login failed:', data.error);
            showToast(data.error || 'Invalid email or password!');
        }
    } catch (error) {
        console.error('Login error:', error);
        console.error('Error stack:', error.stack);
        showToast('Connection error. Please try again.');
    }
}

// Handle Registration
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    
    // Validation
    if (password !== confirmPassword) {
        showToast('Passwords do not match!');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters!');
        return;
    }
    
    try {
        const response = await fetch(`${window.API_URL || '/api'}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Auto login after registration
            const loginResponse = await fetch(`${window.API_URL || '/api'}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const loginData = await loginResponse.json();
            
            if (loginResponse.ok) {
                currentUser = loginData.user;
                localStorage.setItem('gamehub_currentUser', JSON.stringify(loginData.user));
                
                updateUIForLoggedInUser();
                toggleAuthModal('register');
                showToast('Account created successfully! Welcome, ' + username + '!');
                
                // Clear form
                event.target.reset();
            }
        } else {
            showToast(data.error || 'Registration failed!');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Connection error. Please try again.');
    }
}

// Handle Forgot Password
function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgot-email').value;
    const user = users.find(u => u.email === email);
    
    if (user) {
        showToast('Password reset link sent to ' + email);
        toggleAuthModal('forgot');
    } else {
        showToast('Email not found!');
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const authLink = document.getElementById('auth-link');
    const userProfile = document.getElementById('user-profile');
    const usernameDisplay = document.getElementById('username-display');
    
    if (currentUser) {
        authLink.style.display = 'none';
        userProfile.style.display = 'block';
        usernameDisplay.textContent = currentUser.username;
    } else {
        authLink.style.display = 'block';
        userProfile.style.display = 'none';
    }
}

// Toggle User Menu
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown-content');
    dropdown.classList.toggle('show');
}

// Close user menu when clicking outside
function initUserMenuClose() {
    document.addEventListener('click', function(event) {
        const userProfile = document.getElementById('user-profile');
        const dropdown = document.getElementById('user-dropdown-content');
        
        if (userProfile && !userProfile.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('gamehub_currentUser');
    sessionStorage.removeItem('gamehub_currentUser');
    
    updateUIForLoggedInUser();
    showToast('Logged out successfully!');
}
