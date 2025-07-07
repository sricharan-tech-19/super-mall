/**
 * Comprehensive Logging Module for Super Mall Application
 * Handles all user actions, system events, and error logging
 */

class Logger {
    constructor() {
        this.logs = [];
        this.sessionId = this.generateSessionId();
        this.initTime = new Date().toISOString();
        this.firebase = null;
        this.db = null;
        this.initFirebase();
    }

    async initFirebase() {
        try {
            // Wait for Firebase service to be ready
            if (window.FirebaseService) {
                await window.FirebaseService.waitForInit();
                this.db = window.FirebaseService.getDb();
                console.log('📊 Logger: Firebase connection established');
            }
        } catch (error) {
            console.error('📊 Logger: Failed to connect to Firebase:', error);
        }
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            return null;
        }
    }

    async log(action, category, details = {}) {
        const logEntry = {
            id: this.generateLogId(),
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            action: action,
            category: category,
            details: details,
            user: this.getCurrentUser(),
            page: window.location.pathname,
            userAgent: navigator.userAgent
        };

        // Store locally
        this.logs.push(logEntry);
        this.logToConsole(action, category, details);

        // Store in Firebase if available
        await this.saveToFirebase(logEntry);

        // Keep only last 1000 logs in memory
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(-1000);
        }
    }

    generateLogId() {
        return 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    logToConsole(action, category, details) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`📊 [${timestamp}] ${action} | ${category}:`, details);
    }

    async saveToFirebase(logEntry) {
        if (!this.db) return;

        try {
            const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js');
            await addDoc(collection(this.db, 'logs'), logEntry);
        } catch (error) {
            console.error('📊 Failed to save log to Firebase:', error);
        }
    }

    // Specific logging methods
    logLogin(userId, role, method = 'email') {
        this.log('LOGIN', 'authentication', {
            userId: userId,
            role: role,
            method: method,
            success: true
        });
    }

    logLoginFailed(email, reason) {
        this.log('LOGIN_FAILED', 'authentication', {
            email: email,
            reason: reason,
            success: false
        });
    }

    logLogout(userId) {
        this.log('LOGOUT', 'authentication', {
            userId: userId,
            sessionDuration: Date.now() - new Date(this.initTime).getTime()
        });
    }

    logRegistration(userId, role) {
        this.log('REGISTRATION', 'authentication', {
            userId: userId,
            role: role,
            success: true
        });
    }

    logError(errorType, errorMessage, stackTrace = null) {
        this.log('ERROR', 'system_error', {
            errorType: errorType,
            errorMessage: errorMessage,
            stackTrace: stackTrace,
            url: window.location.href
        });
    }

    logNavigation(fromPage, toPage, userId = null) {
        this.log('PAGE_NAVIGATION', 'navigation', {
            userId: userId,
            fromPage: fromPage,
            toPage: toPage
        });
    }
}

// Initialize global logger instance
window.Logger = new Logger();

// Global error handler
window.addEventListener('error', function(event) {
    if (window.Logger) {
        window.Logger.logError(
            'JavaScript Error',
            event.message,
            event.error ? event.error.stack : null
        );
    }
});

export default Logger;