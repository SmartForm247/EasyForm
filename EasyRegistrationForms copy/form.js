// Firebase Configuration (same as app.js)
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

// Global Variables
let currentUser = null;
let formType = null;
let formCost = 0;
let directors = [];

// DOM Elements
const notification = document.getElementById('notification');
const loadingSpinner = document.getElementById('loadingSpinner');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'authenticate.html';
        } else {
            currentUser = user;
            updateSubmissionCost();
        }
    });

    // Logout
    document.getElementById('logoutLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut();
    });

    

    // Form Submit
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', submitForm);
    }
});

// Set form type (called from each HTML file)
window.setFormType = function(type, cost) {
    formType = type;
    formCost = cost;
    updateSubmissionCost();
};

// Functions
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

function updateSubmissionCost() {
    if (!currentUser || !formType) return;

    db.collection('users').doc(currentUser.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                const freeSubmissions = Math.max(0, 2 - (userData.usage_count || 0));
                const costElement = document.getElementById('submissionCostInfo');
                
                if (costElement) {
                    if (freeSubmissions > 0) {
                        costElement.textContent = `This submission is free. You have ${freeSubmissions - 1} free submissions remaining.`;
                    } else {
                        costElement.textContent = `This submission will cost ${formCost} GHS.`;
                    }
                }
            }
        })
        .catch((error) => {
            console.error('Error checking user data:', error);
        });
}


function submitForm(e) {
    e.preventDefault();
    
    if (!formType || !currentUser) {
        showNotification('Form not properly initialized', 'error');
        return;
    }
    
    showLoading(true);
    
    // Check if user has enough credits
    db.collection('users').doc(currentUser.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                const freeSubmissions = Math.max(0, 2 - (userData.usage_count || 0));
                
                if (freeSubmissions === 0 && (userData.credit_balance || 0) < formCost) {
                    showLoading(false);
                    showNotification('Insufficient credits. Please top up your account.', 'error');
                    return;
                }
                
            
                
                // Save submission to Firestore
                db.collection('submissions').add(submissionData)
                    .then((docRef) => {
                        // Update user data
                        const updates = {
                            usage_count: firebase.firestore.FieldValue.increment(1)
                        };
                        
                        if (freeSubmissions === 0) {
                            // Deduct cost from credit balance
                            updates.credit_balance = firebase.firestore.FieldValue.increment(-formCost);
                            
                            // Add transaction record
                            const transaction = {
                                type: 'debit',
                                amount: formCost,
                                description: `Business registration (${formType})`,
                                timestamp: new Date(),
                                ref: docRef.id
                            };
                            
                            updates.transactions = firebase.firestore.FieldValue.arrayUnion(transaction);
                        }
                        
                        // Update user document
                        return db.collection('users').doc(currentUser.uid).update(updates);
                    })
                    .then(() => {
                        showLoading(false);
                        showNotification('Registration submitted successfully!', 'success');
                        
                        // Redirect to dashboard after 2 seconds
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 2000);
                    })
                    .catch((error) => {
                        showLoading(false);
                        showNotification(error.message, 'error');
                    });
            }
        })
        .catch((error) => {
            showLoading(false);
            showNotification(error.message, 'error');
        });
}