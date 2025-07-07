/**
 * Filter Module for Super Mall Application
 * Handles filtering and search functionality
 */

class FilterManager {
    constructor() {
        this.activeFilters = {
            category: 'all',
            floor: 'all',
            searchTerm: '',
            priceRange: { min: 0, max: 10000 },
            hasOffers: false,
            sortBy: 'name'
        };
        this.filteredResults = [];
        this.originalData = [];
    }

    setData(data) {
        this.originalData = data;
        this.applyFilters();
    }

    updateFilter(filterType, value) {
        this.activeFilters[filterType] = value;
        this.applyFilters();
        
        // Log filter usage
        if (window.Logger) {
            const currentUser = window.AuthManager?.getCurrentUser();
            if (currentUser) {
                window.Logger.log('FILTER_APPLIED', 'user_activity', {
                    userId: currentUser.id,
                    filterType: filterType,
                    filterValue: value,
                    resultCount: this.filteredResults.length
                });
            }
        }
    }

    applyFilters() {
        let filtered = [...this.originalData];

        // Apply search term filter
        if (this.activeFilters.searchTerm) {
            const searchTerm = this.activeFilters.searchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(searchTerm) ||
                (item.description && item.description.toLowerCase().includes(searchTerm)) ||
                (item.category && item.category.toLowerCase().includes(searchTerm))
            );
        }

        // Apply category filter
        if (this.activeFilters.category !== 'all') {
            filtered = filtered.filter(item => item.category === this.activeFilters.category);
        }

        // Apply floor filter
        if (this.activeFilters.floor !== 'all') {
            filtered = filtered.filter(item => item.floor === parseInt(this.activeFilters.floor));
        }

        // Apply sorting
        filtered = this.sortResults(filtered, this.activeFilters.sortBy);

        this.filteredResults = filtered;
        this.notifyFilterChange();
    }

    sortResults(data, sortBy) {
        const sortedData = [...data];
        
        switch (sortBy) {
            case 'name':
                return sortedData.sort((a, b) => a.name.localeCompare(b.name));
            
            case 'category':
                return sortedData.sort((a, b) => a.category.localeCompare(b.category));
            
            case 'floor':
                return sortedData.sort((a, b) => a.floor - b.floor);
            
            case 'newest':
                return sortedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            default:
                return sortedData;
        }
    }

    notifyFilterChange() {
        // Dispatch custom event for components to listen to
        const event = new CustomEvent('filtersChanged', {
            detail: {
                filters: this.activeFilters,
                results: this.filteredResults,
                resultCount: this.filteredResults.length
            }
        });
        document.dispatchEvent(event);
    }

    getFilteredResults() {
        return this.filteredResults;
    }

    getActiveFilters() {
        return { ...this.activeFilters };
    }

    clearFilters() {
        this.activeFilters = {
            category: 'all',
            floor: 'all',
            searchTerm: '',
            priceRange: { min: 0, max: 10000 },
            hasOffers: false,
            sortBy: 'name'
        };
        this.applyFilters();
    }
}

// Create global filter manager instance
window.FilterManager = new FilterManager();

export default FilterManager;