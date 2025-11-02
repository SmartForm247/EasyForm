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

    // Add Director Button
    document.getElementById('addDirectorBtn')?.addEventListener('click', addDirector);

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

function addDirector() {
    const directorId = Date.now();
    const directorItem = document.createElement('div');
    directorItem.className = 'director-item';
    directorItem.id = `director-${directorId}`;
    
    directorItem.innerHTML = `
        <button class="remove-btn" onclick="removeDirector(${directorId})">
            <i class="fas fa-times"></i>
        </button>
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-control director-name" required>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">Phone Number</label>
                <div class="input-group">
                    <span class="input-group-text">+233</span>
                    <input type="tel" class="form-control director-phone" required>
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control director-email" required>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">Address</label>
                <input type="text" class="form-control director-address" required>
            </div>
        </div>
    `;
    
    document.getElementById('directorsList').appendChild(directorItem);
    
    directors.push({
        id: directorId,
        name: '',
        phone: '',
        email: '',
        address: ''
    });
}

function removeDirector(directorId) {
    document.getElementById(`director-${directorId}`).remove();
    directors = directors.filter(d => d.id !== directorId);
}

function collectFormData() {
    const form = document.querySelector('form');
    const formData = new FormData(form);
    const data = {};
    
    // Collect all form fields
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Collect directors if present
    const directorItems = document.querySelectorAll('.director-item');
    if (directorItems.length > 0) {
        data.directors = [];
        directorItems.forEach(item => {
            data.directors.push({
                name: item.querySelector('.director-name').value,
                phone: item.querySelector('.director-phone').value,
                email: item.querySelector('.director-email').value,
                address: item.querySelector('.director-address').value
            });
        });
    }
    
    return data;
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
                
                // Prepare submission data
                const submissionData = {
                    userId: currentUser.uid,
                    formType: formType,
                    formData: collectFormData(),
                    status: 'pending',
                    submittedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
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