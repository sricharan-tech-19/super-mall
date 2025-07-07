/**
 * Shop Management Module for Super Mall Application
 * Handles shop CRUD operations and shop-related functionality
 */

class ShopManager {
    constructor() {
        this.shops = [];
        this.categories = [
            'Fashion', 'Electronics', 'Food & Dining', 'Beauty & Care',
            'Sports', 'Books', 'Home & Garden', 'Entertainment'
        ];
        this.floors = [0, 1, 2, 3]; // Ground floor = 0
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
                console.log('🏪 Shop Manager initialized successfully');
            }
        } catch (error) {
            console.error('🏪 Failed to initialize Shop Manager:', error);
        }
    }

    async getAllShops() {
        try {
            const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js');
            
            const shopsQuery = query(collection(this.db, 'shops'), orderBy('name'));
            const querySnapshot = await getDocs(shopsQuery);
            
            this.shops = [];
            querySnapshot.forEach((doc) => {
                this.shops.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            if (window.Logger) {
                window.Logger.log('GET_SHOPS', 'shop_management', { count: this.shops.length });
            }
            
            return this.shops;
        } catch (error) {
            console.error('🏪 Error fetching shops:', error);
            if (window.Logger) {
                window.Logger.logError('Get Shops Failed', error.message);
            }
            throw error;
        }
    }

    async createShop(shopData) {
        try {
            const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js');
            
            const currentUser = window.AuthManager?.getCurrentUser();
            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Unauthorized: Admin access required');
            }
            
            const shop = {
                ...shopData,
                ownerId: currentUser.id,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const docRef = await addDoc(collection(this.db, 'shops'), shop);
            
            if (window.Logger) {
                window.Logger.log('CREATE_SHOP', 'shop_management', { 
                    shopId: docRef.id, 
                    adminId: currentUser.id 
                });
            }
            
            return docRef.id;
        } catch (error) {
            console.error('🏪 Error creating shop:', error);
            if (window.Logger) {
                window.Logger.logError('Create Shop Failed', error.message);
            }
            throw error;
        }
    }

    getCategories() {
        return this.categories;
    }

    getFloors() {
        return this.floors;
    }

    getFloorName(floor) {
        const floorNames = {
            0: 'Ground Floor',
            1: 'First Floor',
            2: 'Second Floor',
            3: 'Third Floor'
        };
        return floorNames[floor] || `Floor ${floor}`;
    }

    validateShopData(shopData) {
        const errors = [];
        
        if (!shopData.name || shopData.name.trim().length < 2) {
            errors.push('Shop name must be at least 2 characters long');
        }
        
        if (!shopData.category || !this.categories.includes(shopData.category)) {
            errors.push('Please select a valid category');
        }
        
        if (shopData.floor === undefined || !this.floors.includes(shopData.floor)) {
            errors.push('Please select a valid floor');
        }
        
        if (!shopData.location || shopData.location.trim().length < 3) {
            errors.push('Location must be at least 3 characters long');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Create global shop manager instance
window.ShopManager = new ShopManager();

export default ShopManager;