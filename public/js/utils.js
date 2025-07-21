/**
 * Utility Functions for Super Mall Application
 * Provides common functionality across the application
 */

class Utils {
    // Format date to readable string
    static formatDate(date) {
        if (!date) return 'N/A';
        
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Format currency
    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    // Validate email
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate phone number
    static validatePhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    // Generate unique ID
    static generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Deep clone object
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = Utils.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    // Get floor name
    static getFloorName(floor) {
        const floorNames = {
            0: 'Ground Floor',
            1: 'First Floor',
            2: 'Second Floor',
            3: 'Third Floor',
            4: 'Fourth Floor'
        };
        return floorNames[floor] || `Floor ${floor}`;
    }

    // Calculate discount percentage
    static calculateDiscountPercentage(originalPrice, discountedPrice) {
        if (originalPrice <= 0) return 0;
        return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
    }

    // Check if mobile device
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Local storage helpers
    static setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to set localStorage:', error);
            return false;
        }
    }

    static getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to get localStorage:', error);
            return defaultValue;
        }
    }

    // Show notification
    static showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform translate-x-full`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-black',
            info: 'bg-blue-500 text-white'
        };
        
        notification.className += ` ${colors[type] || colors.info}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Loading spinner
    static showLoading(container, message = 'Loading...') {
        const loadingHTML = `
            <div class="flex flex-col items-center justify-center p-8">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p class="text-gray-600">${message}</p>
            </div>
        `;
        
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }
        
        if (container) {
            container.innerHTML = loadingHTML;
        }
    }

    // Copy to clipboard
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            Utils.showNotification('Copied to clipboard!', 'success');
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            Utils.showNotification('Failed to copy to clipboard', 'error');
            return false;
        }
    }
}

// Mobile Navigation Manager
class MobileNavManager {
    constructor() {
        this.lastScrollY = 0;
        this.isNavVisible = true;
        this.isMobileMenuOpen = false;
        this.scrollThreshold = 10;
        this.init();
    }

    init() {
        if (this.isMobile()) {
            this.setupMobileNav();
            this.setupScrollListener();
            document.body.classList.add('mobile-nav-active');
        }
    }

    isMobile() {
        return window.innerWidth <= 768;
    }

    setupMobileNav() {
        // Add mobile navigation elements to existing navbars
        const navbars = document.querySelectorAll('.glass-effect nav, nav.glass-effect');
        
        navbars.forEach(navbar => {
            if (!navbar.querySelector('.mobile-menu-toggle')) {
                this.addMobileNavElements(navbar);
            }
        });
    }

    addMobileNavElements(navbar) {
        // Create mobile menu toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'mobile-menu-toggle';
        toggleButton.innerHTML = `
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        `;
        toggleButton.addEventListener('click', () => this.toggleMobileMenu());

        // Find the navbar container and add toggle button
        const navContainer = navbar.querySelector('.flex.justify-between, .flex');
        if (navContainer) {
            navContainer.appendChild(toggleButton);
        }

        // Create mobile navigation menu
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-nav-menu';
        mobileMenu.id = 'mobileNavMenu';
        
        // Add navigation items based on current page
        const navItems = this.getMobileNavItems();
        mobileMenu.innerHTML = navItems.map(item => 
            `<a href="${item.href}" class="mobile-nav-item">${item.text}</a>`
        ).join('');

        // Insert mobile menu after navbar
        navbar.parentNode.insertBefore(mobileMenu, navbar.nextSibling);
    }

    getMobileNavItems() {
        const currentPage = window.location.pathname;
        const currentUser = this.getCurrentUser();
        
        let navItems = [
            { href: 'index.html', text: '🏠 Home' }
        ];

        if (currentUser) {
            if (currentUser.role === 'admin') {
                navItems.push(
                    { href: 'admin-dashboard.html', text: '👑 Admin Dashboard' },
                    { href: '#', text: '🏪 Manage Shops', onclick: 'showSection("manageShops")' },
                    { href: '#', text: '🎯 Manage Offers', onclick: 'showSection("manageOffers")' },
                    { href: '#', text: '📂 Manage Categories', onclick: 'showSection("manageCategories")' }
                );
            } else {
                navItems.push(
                    { href: 'user-dashboard.html', text: '👤 User Dashboard' },
                    { href: '#', text: '🏪 Browse Shops', onclick: 'showSection("browseShops")' },
                    { href: '#', text: '🎯 Special Offers', onclick: 'showSection("specialOffers")' },
                    { href: '#', text: '📊 Compare Products', onclick: 'showSection("compareProducts")' }
                );
            }
            navItems.push({ href: '#', text: '🚪 Logout', onclick: 'logout()' });
        } else {
            navItems.push(
                { href: 'login.html', text: '🔐 Login' },
                { href: 'register.html', text: '📝 Register' }
            );
        }

        return navItems;
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            return null;
        }
    }

    setupScrollListener() {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScrollDirection();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', () => {
            if (!this.isMobile()) {
                this.showNavbar();
                this.closeMobileMenu();
                document.body.classList.remove('mobile-nav-active');
            } else {
                document.body.classList.add('mobile-nav-active');
            }
        });
    }

    handleScrollDirection() {
        const currentScrollY = window.scrollY;
        
        if (Math.abs(currentScrollY - this.lastScrollY) < this.scrollThreshold) {
            return;
        }

        if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
            // Scrolling down - hide navbar
            this.hideNavbar();
        } else {
            // Scrolling up - show navbar
            this.showNavbar();
        }

        this.lastScrollY = currentScrollY;
    }

    hideNavbar() {
        if (this.isNavVisible) {
            const navbars = document.querySelectorAll('nav.glass-effect, .glass-effect nav');
            navbars.forEach(navbar => {
                navbar.classList.add('hidden');
                navbar.classList.remove('visible');
            });
            this.isNavVisible = false;
            this.closeMobileMenu();
        }
    }

    showNavbar() {
        if (!this.isNavVisible) {
            const navbars = document.querySelectorAll('nav.glass-effect, .glass-effect nav');
            navbars.forEach(navbar => {
                navbar.classList.remove('hidden');
                navbar.classList.add('visible');
            });
            this.isNavVisible = true;
        }
    }

    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobileNavMenu');
        if (mobileMenu) {
            if (this.isMobileMenuOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
    }

    openMobileMenu() {
        const mobileMenu = document.getElementById('mobileNavMenu');
        if (mobileMenu) {
            mobileMenu.classList.add('open');
            this.isMobileMenuOpen = true;
            
            // Update toggle button icon
            const toggleButton = document.querySelector('.mobile-menu-toggle');
            if (toggleButton) {
                toggleButton.innerHTML = `
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                `;
            }
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileNavMenu');
        if (mobileMenu) {
            mobileMenu.classList.remove('open');
            this.isMobileMenuOpen = false;
            
            // Update toggle button icon
            const toggleButton = document.querySelector('.mobile-menu-toggle');
            if (toggleButton) {
                toggleButton.innerHTML = `
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                `;
            }
        }
    }

    // Public methods for external use
    forceShowNav() {
        this.showNavbar();
    }

    forceHideNav() {
        this.hideNavbar();
    }
}

// Make Utils available globally
window.Utils = Utils;
window.MobileNavManager = MobileNavManager;

export default Utils;
