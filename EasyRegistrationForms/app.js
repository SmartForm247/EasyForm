// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzSHkVxRiLC5gsq04LTTDnXaGdoF7eJ2c",
    authDomain: "easyregistrationforms.firebaseapp.com",
    projectId: "easyregistrationforms",
    storageBucket: "easyregistrationforms.firebasestorage.app",
    messagingSenderId: "589421628989",
    appId: "1:589421628989:web:d9f6e9dbe372ab7acd6454",
    measurementId: "G-GVCPBN8VB5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Paystack Configuration
const paystackKey = "pk_live_4126067326a4ff0fbdac73d10db5474b483a824d";

// Global Variables
let currentUser = null;
let userListener = null;

// DOM Elements
const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const notification = document.getElementById('notification');
const loadingSpinner = document.getElementById('loadingSpinner');
const topUpModal = new bootstrap.Modal(document.getElementById('topUpModal'));

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            loadUserData();
            showSection('dashboard');
        } else {
            showSection('auth');
        }
    });

    // Logout - Multiple event listeners for both logout links/buttons
    document.getElementById('logoutLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    // Dashboard Actions
    document.getElementById('topUpBtn')?.addEventListener('click', () => {
        topUpModal.show();
    });

    document.getElementById('viewSubmissionsBtn')?.addEventListener('click', () => {
        window.location.href = 'llc-dashboard.html';
    });

    // Copy Link Button
    document.getElementById('copyLinkBtn')?.addEventListener('click', () => {
        const shareableLink = document.getElementById('shareableLink').value;
        navigator.clipboard.writeText(shareableLink)
            .then(() => {
                showNotification('Link copied to clipboard!', 'success');
            })
            .catch(err => {
                showNotification('Failed to copy link', 'error');
            });
    });

    // Top Up Modal
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('customAmount').value = btn.dataset.amount;
            document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', () => {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
            method.classList.add('selected');
        });
    });

    document.getElementById('processPaymentBtn')?.addEventListener('click', processPayment);
});

// Functions
function showSection(section) {
    authSection?.classList.remove('active');
    dashboardSection?.classList.remove('active');

    if (section === 'auth') {
        authSection?.classList.add('active');
    } else if (section === 'dashboard') {
        dashboardSection?.classList.add('active');
    }
}

function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

function showLoading(show) {
    if (show) {
        loadingSpinner.classList.add('active');
    } else {
        loadingSpinner.classList.remove('active');
    }
}

function logout() {
    showLoading(true);
    auth.signOut()
        .then(() => {
            showLoading(false);
            showNotification('Logged out successfully', 'success');
            showSection('auth');
        })
        .catch((error) => {
            showLoading(false);
            showNotification('Error logging out: ' + error.message, 'error');
        });
}

// FIXED: Consistent unique ID generation (same as auth.js)
function generateUniqueId(firstName, email) {
    // Clean the first name - remove spaces and special characters
    const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Get first 6 characters of email (before @)
    const emailPart = email.split('@')[0];
    const emailPrefix = emailPart.substring(0, 6);
    
    // Generate a random 4-digit number
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    
    // Combine clean first name + email prefix + random digits
    return `${cleanFirstName}${emailPrefix}${randomDigits}`;
}

// Real-time Firestore listener with improved error handling
function loadUserData() {
    console.log('Setting up real-time listener for user:', currentUser.uid);
    showLoading(true);

    const userDocRef = db.collection('users').doc(currentUser.uid);

    // Detach any previous listener
    if (userListener) {
        userListener();
    }

    // Set up new real-time listener
    userListener = userDocRef.onSnapshot(
        (doc) => {
            showLoading(false);
            if (doc.exists) {
                console.log('User data updated in real-time:', doc.data());
                updateDashboard(doc.data());
            } else {
                console.log('User document not found, creating new one.');
                
                // Generate unique ID and shareable link for new users
                const email = currentUser.email;
                const firstName = email.split('@')[0]; // Use email prefix as default first name
                const uniqueId = generateUniqueId(firstName, email);
                
                const userData = {
                    email: email,
                    firstName: firstName,
                    uniqueId: uniqueId,
                    shareableLink: 'Generating link...', // IMPORTANT: Placeholder first
                    credit_balance: 0,
                    usage_count: 0,
                    transactions: [],
                    created_at: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                console.log('Creating new user with data:', userData);
                
                // Update the UI with the placeholder first
                updateDashboard(userData);
                
                // Now, create the shareable link and save everything to Firestore
                const shareableLink = `https://smartform247.github.io/EasyForm/EasyRegistrationForms/llc-input-form.html?owner=${uniqueId}`;
                userData.shareableLink = shareableLink; // Update the object with the real link

                userDocRef.set(userData)
                    .then(() => {
                        console.log('New user document created with link.');
                        // Update the dashboard AGAIN now that the link is real and saved
                        updateDashboard(userData);
                    })
                    .catch((error) => {
                        console.error('Error creating user document:', error);
                        showNotification('Error creating user profile: ' + error.message, 'error');
                    });
            }
        },
        (error) => {
            showLoading(false);
            console.error('Real-time listener error:', error);
            
            // Handle permission errors specifically
            if (error.code === 'permission-denied') {
                showNotification('Permission denied. Please try logging out and logging back in.', 'error');
                loadUserDataOnce();
            } else {
                showNotification('Error loading user data: ' + error.message, 'error');
            }
        }
    );
}

// Fallback function to load user data once instead of using a real-time listener
function loadUserDataOnce() {
    console.log('Attempting to load user data with one-time query');
    showLoading(true);
    
    db.collection('users').doc(currentUser.uid).get()
        .then((doc) => {
            showLoading(false);
            if (doc.exists) {
                console.log('User data loaded with one-time query:', doc.data());
                updateDashboard(doc.data());
            } else {
                console.log('User document not found even with one-time query');
                showNotification('User profile not found. Please contact support.', 'error');
            }
        })
        .catch((error) => {
            showLoading(false);
            console.error('Error with one-time user data query:', error);
            showNotification('Error loading user data. Please try refreshing the page.', 'error');
        });
}

// Fallback function to create user document with a different approach
function createUserWithFallback(userData) {
    console.log('Attempting to create user document with fallback method');
    
    // Try using a batched write
    const batch = db.batch();
    const userDocRef = db.collection('users').doc(currentUser.uid);
    batch.set(userDocRef, userData);
    
    batch.commit()
        .then(() => {
            console.log('User document created with batch write');
            updateDashboard(userData);
        })
        .catch((error) => {
            console.error('Error with batch write:', error);
            showNotification('Unable to create user profile. Please try again later.', 'error');
        });
}

function updateDashboard(userData) {
    console.log('Updating dashboard with data:', userData);
    
    // Update user name
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userData.firstName || userData.email.split('@')[0] || 'User';
    }
    
    // Update credit balance
    const balanceElement = document.getElementById('creditBalance');
    if (balanceElement) {
        balanceElement.textContent = `${userData.credit_balance || 0} GHS`;
    }
    
    // Update usage count
    const usageElement = document.getElementById('usageCount');
    if (usageElement) {
        usageElement.textContent = userData.usage_count || 0;
    }
    
    // Update free submissions
    const freeSubmissions = Math.max(0, 2 - (userData.usage_count || 0));
    const freeSubmissionsElement = document.getElementById('freeSubmissions');
    if (freeSubmissionsElement) {
        freeSubmissionsElement.textContent = freeSubmissions;
    }
    
    // Update shareable link - This is the key part
    const shareableLinkElement = document.getElementById('shareableLink');
    if (shareableLinkElement) {
        // Check if shareableLink exists in userData
        if (userData.shareableLink) {
            shareableLinkElement.value = userData.shareableLink;
            console.log('Shareable link set to:', userData.shareableLink);
        } else if (userData.uniqueId) {
            // If shareableLink doesn't exist but uniqueId does, create the link
            const shareableLink = `https://smartform247.github.io/EasyForm/EasyRegistrationForms/llc-input-form.html?owner=${userData.uniqueId}`;
            shareableLinkElement.value = shareableLink;
            
            // Update the user document with the shareable link
            db.collection('users').doc(currentUser.uid).update({
                shareableLink: shareableLink
            }).then(() => {
                console.log('Shareable link updated in Firestore');
            }).catch(error => {
                console.error('Error updating shareable link:', error);
            });
        } else {
            // If neither exists, show a placeholder
            shareableLinkElement.value = 'Generating link...';
            console.warn('No uniqueId found for user');
        }
    }
    
    // Update transactions list
    const transactionsList = document.getElementById('transactionsList');
    if (transactionsList) {
        if (userData.transactions && userData.transactions.length > 0) {
            transactionsList.innerHTML = '';
            userData.transactions.slice(0, 5).forEach(transaction => {
                const transactionItem = document.createElement('div');
                transactionItem.className = 'transaction-item';
                
                const date = transaction.timestamp ? 
                    (transaction.timestamp.toDate ? new Date(transaction.timestamp.toDate()).toLocaleDateString() : new Date(transaction.timestamp).toLocaleDateString()) : 
                    'N/A';
                const type = transaction.type === 'credit' ? 'Credit' : 'Debit';
                const sign = transaction.type === 'credit' ? '+' : '-';
                
                transactionItem.innerHTML = `
                    <div class="d-flex justify-content-between">
                        <div>
                            <div class="fw-bold">${type}</div>
                            <div class="text-muted small">${date}</div>
                        </div>
                        <div class="fw-bold ${transaction.type === 'credit' ? 'text-success' : 'text-danger'}">
                            ${sign}${transaction.amount} GHS
                        </div>
                    </div>
                `;
                
                transactionsList.appendChild(transactionItem);
            });
        } else {
            transactionsList.innerHTML = '<p class="text-muted">No transactions yet</p>';
        }
    }
    
    console.log('Dashboard updated successfully');
}

// Process Payment
function processPayment() {
    const amountInput = document.getElementById('customAmount').value.trim();
    const amount = Number(amountInput);
    const selectedPaymentMethod = document.querySelector('.payment-method.selected');
    const paymentNumber = document.getElementById('paymentNumber').value.trim();
    const email = document.getElementById('paymentEmail').value.trim() || 'user@example.com';

    if (!amount || isNaN(amount) || amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }

    if (!selectedPaymentMethod) {
        showNotification('Please select a payment method', 'error');
        return;
    }

    if (!paymentNumber) {
        showNotification('Please enter your mobile money number', 'error');
        return;
    }

    const paymentMethod = selectedPaymentMethod.dataset.method;

    console.log('Processing payment:', { amount, paymentMethod, paymentNumber });

    const handler = PaystackPop.setup({
        key: paystackKey,
        email: email,
        amount: amount * 100, // GHS → pesewas
        currency: 'GHS',
        ref: 'PSK' + Math.floor((Math.random() * 1000000000) + 1),
        callback: function (response) {
            console.log('✅ Payment callback received:', response);
            showLoading(true);

            const transaction = {
                type: 'credit',
                amount: amount,
                method: 'Mobile Money',
                provider: paymentMethod,
                timestamp: new Date(),
                ref: response.reference
            };

            const userDocRef = db.collection('users').doc(currentUser.uid);

            userDocRef.get().then((doc) => {
                if (doc.exists) {
                    console.log('User exists — updating credit balance...');
                    return userDocRef.update({
                        credit_balance: firebase.firestore.FieldValue.increment(amount),
                        transactions: firebase.firestore.FieldValue.arrayUnion(transaction)
                    });
                } else {
                    console.log('Creating new user document...');
                    return userDocRef.set({
                        email: currentUser.email,
                        credit_balance: amount,
                        usage_count: 0,
                        transactions: [transaction],
                        created_at: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            })
            .then(() => {
                console.log('✅ Firestore updated successfully.');
                showLoading(false);
                topUpModal.hide();
                showNotification('Payment successful! Credits added to your account.', 'success');

                // Reset form fields
                document.getElementById('customAmount').value = '';
                document.getElementById('paymentNumber').value = '';
                document.getElementById('paymentEmail').value = '';
                document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
                document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
            })
            .catch((error) => {
                console.error('🔥 Error updating Firestore:', error);
                showLoading(false);
                showNotification('Error updating account: ' + error.message, 'error');
            });
        },
        onClose: function () {
            console.log('Payment closed by user.');
            showNotification('Payment cancelled', 'info');
        }
    });

    handler.openIframe();
}

// Debug function
function debugUserData() {
    if (currentUser) {
        db.collection('users').doc(currentUser.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    console.log('User data from Firestore:', doc.data());
                    console.log('Shareable link:', doc.data().shareableLink);
                    console.log('Unique ID:', doc.data().uniqueId);
                } else {
                    console.log('No user document found');
                }
            })
            .catch((error) => {
                console.error('Error getting user data:', error);
            });
    } else {
        console.log('No current user');
    }
}

// Make the debug function available globally
window.debugUserData = debugUserData;