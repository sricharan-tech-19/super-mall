/**
 * Product Comparison Module for Super Mall Application
 * Handles product comparison functionality
 */

class ComparisonManager {
    constructor() {
        this.comparisonList = [];
        this.maxComparisons = 3;
        this.comparisonData = null;
    }

    addToComparison(product) {
        // Check if product is already in comparison
        if (this.isInComparison(product.id)) {
            throw new Error('Product is already in comparison list');
        }

        // Check if comparison list is full
        if (this.comparisonList.length >= this.maxComparisons) {
            throw new Error(`Maximum ${this.maxComparisons} products can be compared`);
        }

        this.comparisonList.push(product);
        this.updateComparisonData();
        this.notifyComparisonChange();

        // Log comparison action
        if (window.Logger) {
            const currentUser = window.AuthManager?.getCurrentUser();
            if (currentUser) {
                window.Logger.log('ADD_TO_COMPARISON', 'user_activity', {
                    userId: currentUser.id,
                    productId: product.id,
                    productName: product.name,
                    comparisonCount: this.comparisonList.length
                });
            }
        }

        return true;
    }

    removeFromComparison(productId) {
        const index = this.comparisonList.findIndex(product => product.id === productId);
        
        if (index === -1) {
            throw new Error('Product not found in comparison list');
        }

        const removedProduct = this.comparisonList.splice(index, 1)[0];
        this.updateComparisonData();
        this.notifyComparisonChange();

        // Log removal action
        if (window.Logger) {
            const currentUser = window.AuthManager?.getCurrentUser();
            if (currentUser) {
                window.Logger.log('REMOVE_FROM_COMPARISON', 'user_activity', {
                    userId: currentUser.id,
                    productId: productId,
                    productName: removedProduct.name,
                    comparisonCount: this.comparisonList.length
                });
            }
        }

        return true;
    }

    clearComparison() {
        this.comparisonList = [];
        this.comparisonData = null;
        this.notifyComparisonChange();

        // Log clear action
        if (window.Logger) {
            const currentUser = window.AuthManager?.getCurrentUser();
            if (currentUser) {
                window.Logger.log('CLEAR_COMPARISON', 'user_activity', {
                    userId: currentUser.id
                });
            }
        }
    }

    isInComparison(productId) {
        return this.comparisonList.some(product => product.id === productId);
    }

    getComparisonList() {
        return [...this.comparisonList];
    }

    getComparisonCount() {
        return this.comparisonList.length;
    }

    canAddMore() {
        return this.comparisonList.length < this.maxComparisons;
    }

    updateComparisonData() {
        if (this.comparisonList.length === 0) {
            this.comparisonData = null;
            return;
        }

        // Create comparison matrix
        const comparisonMatrix = {
            products: this.comparisonList,
            comparison: {}
        };

        // Basic comparison fields
        const basicFields = [
            { key: 'name', label: 'Product Name', type: 'text' },
            { key: 'price', label: 'Current Price', type: 'currency' },
            { key: 'category', label: 'Category', type: 'text' },
            { key: 'shopName', label: 'Shop', type: 'text' }
        ];

        // Add basic fields to comparison
        basicFields.forEach(field => {
            comparisonMatrix.comparison[field.key] = {
                label: field.label,
                type: field.type,
                values: this.comparisonList.map(product => product[field.key] || 'N/A')
            };
        });

        this.comparisonData = comparisonMatrix;
    }

    getComparisonData() {
        return this.comparisonData;
    }

    notifyComparisonChange() {
        // Dispatch custom event for components to listen to
        const event = new CustomEvent('comparisonChanged', {
            detail: {
                comparisonList: this.comparisonList,
                comparisonData: this.comparisonData,
                count: this.comparisonList.length,
                canAddMore: this.canAddMore()
            }
        });
        document.dispatchEvent(event);
    }
}

// Create global comparison manager instance
window.ComparisonManager = new ComparisonManager();

export default ComparisonManager;