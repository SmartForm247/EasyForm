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

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const notification = document.getElementById('notification');
const loadingSpinner = document.getElementById('loadingSpinner');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    showLoading(true);
    auth.onAuthStateChanged(user => {
        if (user) {
            window.location.href = '../../index.html';
        } else {
            showLoading(false);
        }
    });

    // Auth Navigation
    document.getElementById('showSignupLink').addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    });

    document.getElementById('showLoginLink').addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Login
    document.getElementById('loginBtn').addEventListener('click', login);

    // Signup
    document.getElementById('signupBtn').addEventListener('click', signup);
});

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
        loadingSpinner.style.display = 'flex';
    } else {
        loadingSpinner.style.display = 'none';
    }
}

// FIXED: Consistent unique ID generation
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

function login() {
    const email = document.getElementById('loginEmail').value;
    const phone = document.getElementById('loginPhone').value;
    
    if (!email || !phone) {
        showNotification('Please enter both email and phone number', 'error');
        return;
    }

    showLoading(true);
    
    // Try to sign in with Firebase Auth first
    auth.signInWithEmailAndPassword(email, phone)
        .then((userCredential) => {
            // Signed in
            showLoading(false);
            window.location.href = '../../index.html';
        })
        .catch((error) => {
            // If sign in fails, check if user exists in Firestore
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                // Check if user exists in Firestore with matching email and phone
                db.collection('users').where('email', '==', email).where('phone', '==', phone).get()
                    .then((querySnapshot) => {
                        if (querySnapshot.empty) {
                            showLoading(false);
                            showNotification('Invalid email or phone number', 'error');
                            return;
                        }
                        
                        // User found in Firestore, create Firebase Auth account
                        auth.createUserWithEmailAndPassword(email, phone)
                            .then((userCredential) => {
                                showLoading(false);
                                window.location.href = '../../index.html';
                            })
                            .catch((createError) => {
                                showLoading(false);
                                showNotification(createError.message, 'error');
                            });
                    })
                    .catch((checkError) => {
                        showLoading(false);
                        showNotification('Network error. Please try again.', 'error');
                    });
            } else {
                showLoading(false);
                showNotification(error.message, 'error');
            }
        });
}

function signup() {
    const firstName = document.getElementById('firstName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const confirmPhone = document.getElementById('confirmPhone').value;
    
    if (!firstName || !email || !phone || !confirmPhone) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    if (phone !== confirmPhone) {
        showNotification('Phone numbers do not match', 'error');
        return;
    }
    
    showLoading(true);
    
    // Create user in Firebase Auth first
    auth.createUserWithEmailAndPassword(email, phone)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Generate unique ID for the owner
            const uniqueId = generateUniqueId(firstName, email);
            
            // Create multiple form links
            const formLinks = {
                llc: `https://smartform247.github.io/EasyForm/EasyRegistrationForms/llc-input-form.html?owner=${uniqueId}`,
                sole: `https://smartform247.github.io/EasyForm/EasyRegistrationForms/sole-input-form.html?owner=${uniqueId}`,
                ngo: `https://smartform247.github.io/EasyForm/EasyRegistrationForms/ngo-input-form.html?owner=${uniqueId}`
            };
            
            // Create user record in Firestore
            const userData = {
                firstName: firstName,
                email: email,
                phone: phone, // IMPORTANT: Save phone number
                uniqueId: uniqueId,
                formLinks: formLinks,
                credit_balance: 0,
                usage_count: 0,
                // Track usage by form type
                formUsage: {
                    llc: 0,
                    sole: 0,
                    ngo: 0
                },
                transactions: [],
                created_at: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            console.log('Creating user with data:', userData);
            
            db.collection('users').doc(user.uid).set(userData)
                .then(() => {
                    console.log('User created successfully');
                    showLoading(false);
                    showNotification('Account created successfully!', 'success');
                    setTimeout(() => {
                       window.location.href = '../../index.html';
                    }, 1500);
                })
                .catch((error) => {
                    console.error('Error creating user document:', error);
                    showLoading(false);
                    showNotification(error.message, 'error');
                });
        })
        .catch((error) => {
            console.error('Error creating user account:', error);
            showLoading(false);
            showNotification(error.message, 'error');
        });
}