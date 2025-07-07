/**
 * Authentication Module for Super Mall Application
 * Handles user login, registration, and session management
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.firebase = null;
        this.auth = null;
        this.db = null;
        this.initFirebase();
    }

    async initFirebase() {
        try {
            // Wait for Firebase service to be ready
            if (window.FirebaseService) {
                await window.FirebaseService.waitForInit();
                this.auth = window.FirebaseService.getAuth();
                this.db = window.FirebaseService.getDb();
                
                // Set up auth state listener
                const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js');
                onAuthStateChanged(this.auth, (user) => {
                    this.handleAuthStateChange(user);
                });
                
                console.log('🔐 Auth Manager initialized successfully');
            }
        } catch (error) {
            console.error('🔐 Failed to initialize Auth Manager:', error);
        }
    }

    async handleAuthStateChange(user) {
        if (user) {
            try {
                const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js');
                const userDoc = await getDoc(doc(this.db, 'users', user.uid));
                if (userDoc.exists()) {
                    this.currentUser = {
                        id: user.uid,
                        ...userDoc.data()
                    };
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    
                    if (window.Logger) {
                        window.Logger.logLogin(this.currentUser.id, this.currentUser.role);
                    }
                } else {
                    console.warn('🔐 User document not found in Firestore');
                    this.currentUser = null;
                }
            } catch (error) {
                console.error('🔐 Error fetching user data:', error);
                this.currentUser = null;
            }
        } else {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
        }
    }

    async login(email, password) {
        try {
            const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js');
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            
            // Get user data from Firestore
            const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js');
            const userDoc = await getDoc(doc(this.db, 'users', userCredential.user.uid));
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                this.currentUser = {
                    id: userCredential.user.uid,
                    ...userData
                };
                
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                if (window.Logger) {
                    window.Logger.logLogin(this.currentUser.id, this.currentUser.role, 'email');
                }
                
                return this.currentUser;
            } else {
                throw new Error('User data not found');
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.logLoginFailed(email, error.message);
            }
            throw error;
        }
    }

    async register(email, password, name, role = 'user') {
        try {
            const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js');
            const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js');
            
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            
            // Create user document in Firestore
            const userData = {
                id: userCredential.user.uid,
                email: email,
                name: name,
                role: role,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await setDoc(doc(this.db, 'users', userCredential.user.uid), userData);
            
            this.currentUser = userData;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            if (window.Logger) {
                window.Logger.logRegistration(this.currentUser.id, this.currentUser.role);
            }
            
            return this.currentUser;
        } catch (error) {
            if (window.Logger) {
                window.Logger.logError('Registration Failed', error.message);
            }
            throw error;
        }
    }

    async logout() {
        try {
            if (this.currentUser && window.Logger) {
                window.Logger.logLogout(this.currentUser.id);
            }
            
            const { signOut } = await import('https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js');
            await signOut(this.auth);
            
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            
            // Redirect to home page
            window.location.href = 'index.html';
        } catch (error) {
            console.error('🔐 Logout error:', error);
            throw error;
        }
    }

    getCurrentUser() {
        if (!this.currentUser) {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                try {
                    this.currentUser = JSON.parse(stored);
                } catch (error) {
                    console.error('🔐 Error parsing stored user data:', error);
                    localStorage.removeItem('currentUser');
                }
            }
        }
        return this.currentUser;
    }

    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    isUser() {
        const user = this.getCurrentUser();
        return user && user.role === 'user';
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    requireAdmin() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        if (!this.isAdmin()) {
            window.location.href = 'user-dashboard.html';
            return false;
        }
        return true;
    }
}

// Create global auth manager instance
window.AuthManager = new AuthManager();

export default AuthManager;