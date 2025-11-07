// Firebase Configuration (same as other files)
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

// Global variables
let currentUser = null;

// Check if user is authenticated
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
    }
});

// Credit costs for different operations
const CREDIT_COSTS = {
    LIMITED_COMPANY_DOWNLOAD: 5,
    SOLE_PROPRIETOR_DOWNLOAD: 3,
    PARTNERSHIP_DOWNLOAD: 4,
    BUSINESS_NAME_DOWNLOAD: 2,
    // Add more operations as needed
};

// DOM Elements
const notification = document.getElementById('notification');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Limited Company Download Button
    const limitedCompanyDownloadBtn = document.getElementById('limited-company-download-btn');
    if (limitedCompanyDownloadBtn) {
        limitedCompanyDownloadBtn.addEventListener('click', async () => {
            await handleCreditDeduction('LIMITED_COMPANY_DOWNLOAD', downloadLimitedCompanyForm);
        });
    }
    
    // Add other download buttons as needed
    const soleProprietorDownloadBtn = document.getElementById('sole-proprietor-download-btn');
    if (soleProprietorDownloadBtn) {
        soleProprietorDownloadBtn.addEventListener('click', async () => {
            await handleCreditDeduction('SOLE_PROPRIETOR_DOWNLOAD', downloadSoleProprietorForm);
        });
    }
    
    const partnershipDownloadBtn = document.getElementById('partnership-download-btn');
    if (partnershipDownloadBtn) {
        partnershipDownloadBtn.addEventListener('click', async () => {
            await handleCreditDeduction('PARTNERSHIP_DOWNLOAD', downloadPartnershipForm);
        });
    }
    
    const businessNameDownloadBtn = document.getElementById('business-name-download-btn');
    if (businessNameDownloadBtn) {
        businessNameDownloadBtn.addEventListener('click', async () => {
            await handleCreditDeduction('BUSINESS_NAME_DOWNLOAD', downloadBusinessNameForm);
        });
    }
});

// Functions
function showNotification(message, type) {
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Main function to handle credit deduction
async function handleCreditDeduction(operationType, callbackFunction) {
    if (!currentUser) {
        showNotification('Please login to perform this action', 'error');
        return;
    }
    
    const cost = CREDIT_COSTS[operationType];
    
    try {
        // Get current user data
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        
        if (!userDoc.exists) {
            showNotification('User data not found', 'error');
            return;
        }
        
        const userData = userDoc.data();
        const currentBalance = userData.credit_balance || 0;
        const usageCount = userData.usage_count || 0;
        
        // Check if user has enough credits or free submissions
        const freeSubmissionsRemaining = Math.max(0, 2 - usageCount);
        
        if (freeSubmissionsRemaining > 0) {
            // Use free submission
            await updateUserUsage();
            showNotification(`Using 1 of your free submissions (${freeSubmissionsRemaining - 1} remaining)`, 'info');
            callbackFunction();
        } else if (currentBalance >= cost) {
            // Deduct credits
            await deductCredits(cost);
            showNotification(`${cost} credits deducted from your account`, 'success');
            callbackFunction();
        } else {
            // Not enough credits
            showNotification(`Insufficient credits. You need ${cost} credits for this operation.`, 'error');
            // Optionally redirect to top-up page
            setTimeout(() => {
                if (confirm('Would you like to top up your credits?')) {
                    window.location.href = '../../index.html#topUp';
                }
            }, 1000);
        }
    } catch (error) {
        console.error('Error processing credit deduction:', error);
        showNotification('Error processing your request. Please try again.', 'error');
    }
}

// Function to update user usage count
async function updateUserUsage() {
    try {
        const transaction = {
            type: 'debit',
            amount: 0,
            description: 'Free submission used',
            timestamp: new Date()
        };
        
        await db.collection('users').doc(currentUser.uid).update({
            usage_count: firebase.firestore.FieldValue.increment(1),
            transactions: firebase.firestore.FieldValue.arrayUnion(transaction)
        });
        
        // Update dashboard if it exists
        updateUsageCount();
    } catch (error) {
        console.error('Error updating usage count:', error);
        throw error;
    }
}

// Function to deduct credits
async function deductCredits(amount) {
    try {
        const transaction = {
            type: 'debit',
            amount: amount,
            description: 'Form download',
            timestamp: new Date()
        };
        
        await db.collection('users').doc(currentUser.uid).update({
            credit_balance: firebase.firestore.FieldValue.increment(-amount),
            usage_count: firebase.firestore.FieldValue.increment(1),
            transactions: firebase.firestore.FieldValue.arrayUnion(transaction)
        });
        
        // Update dashboard if it exists
        updateCreditBalance(-amount);
        updateUsageCount();
    } catch (error) {
        console.error('Error deducting credits:', error);
        throw error;
    }
}

// Functions to update dashboard elements
function updateCreditBalance(change) {
    const balanceElement = document.getElementById('creditBalance');
    if (balanceElement) {
        const currentBalance = parseInt(balanceElement.textContent) || 0;
        balanceElement.textContent = `${currentBalance + change} GHS`;
    }
}

function updateUsageCount() {
    const usageElement = document.getElementById('usageCount');
    const freeSubmissionsElement = document.getElementById('freeSubmissions');
    
    if (usageElement && freeSubmissionsElement) {
        const currentUsage = parseInt(usageElement.textContent) || 0;
        const newUsage = currentUsage + 1;
        const freeSubmissions = Math.max(0, 2 - newUsage);
        
        usageElement.textContent = newUsage;
        freeSubmissionsElement.textContent = freeSubmissions;
    }
}

// Download functions
function downloadLimitedCompanyForm() {
    // Your existing download function
    const element = document.body;
    const buttonContainer = document.querySelector(".button-container");
    const sect1 = document.getElementById("sect1");
    const sect2 = document.querySelector(".sect2");

    buttonContainer.style.display = "none";
    sect1.style.display = "none";

    // Show sect2 temporarily
    const sect2OriginalDisplay = sect2 ? sect2.style.display : null;
    if (sect2) sect2.style.display = "block";

    // Scroll to top before capturing
    window.scrollTo(0, 0);

    // Wait a short moment to let browser repaint
    setTimeout(() => {
        const options = {
            margin: 0,
            filename: 'limited-company-form.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf()
            .set(options)
            .from(element)
            .save()
            .then(() => {
                // Restore visibility
                buttonContainer.style.display = "block";
                sect1.style.display = "block";
                if (sect2) sect2.style.display = sect2OriginalDisplay;
            })
            .catch(err => {
                console.error("PDF generation error:", err);
                // Restore visibility even if there was an error
                buttonContainer.style.display = "block";
                sect1.style.display = "block";
                if (sect2) sect2.style.display = sect2OriginalDisplay;
            });
    }, 300);
}

// Add other download functions as needed
function downloadSoleProprietorForm() {
    // Implementation for sole proprietor form download
    showNotification('Sole Proprietor form download started', 'info');
    // Add your implementation here
}

function downloadPartnershipForm() {
    // Implementation for partnership form download
    showNotification('Partnership form download started', 'info');
    // Add your implementation here
}

function downloadBusinessNameForm() {
    // Implementation for business name form download
    showNotification('Business Name form download started', 'info');
    // Add your implementation here
}