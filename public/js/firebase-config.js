/**
 * Firebase Configuration and Service Module
 * Centralized Firebase setup and common database operations
 */

class FirebaseService {
    constructor() {
        this.app = null;
        this.auth = null;
        this.db = null;
        this.initialized = false;
        this.initPromise = this.init();
    }

    async init() {
        try {
            // Import Firebase modules
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js');
            const { getAuth } = await import('https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js');
            const { getFirestore } = await import('https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js');

            // Firebase configuration
            const firebaseConfig = {
                apiKey: "AIzaSyCWxsvXth0FNodQou5VnKHQ5oEXOArHQ84",
                authDomain: "super-mall-6ebf8.firebaseapp.com",
                projectId: "super-mall-6ebf8",
                storageBucket: "super-mall-6ebf8.firebasestorage.app",
                messagingSenderId: "1069221230308",
                appId: "1:1069221230308:web:15726e2b2bcf766dc6def1"
            };

            // Initialize Firebase
            this.app = initializeApp(firebaseConfig);
            this.auth = getAuth(this.app);
            this.db = getFirestore(this.app);
            this.initialized = true;

            console.log('🔥 Firebase initialized successfully');
            
            if (window.Logger) {
                window.Logger.log('SYSTEM', 'firebase_init', { status: 'success' });
            }

            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Firebase:', error);
            
            if (window.Logger) {
                window.Logger.logError('Firebase Initialization', error.message, error.stack);
            }
            
            throw error;
        }
    }

    async waitForInit() {
        await this.initPromise;
        return this.initialized;
    }

    getAuth() {
        return this.auth;
    }

    getDb() {
        return this.db;
    }

    getApp() {
        return this.app;
    }
}

// Create global Firebase service instance
window.FirebaseService = new FirebaseService();

export default FirebaseService;