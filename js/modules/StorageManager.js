class StorageManager {
    constructor() {
        this.countsKey = 'buddhistChantCounts';
        this.offeringsKey = 'buddhist_offerings';
    }
    
    saveCounts(counts) {
        try {
            localStorage.setItem(this.countsKey, JSON.stringify(counts));
        } catch (error) {
            console.error('保存计数失败:', error);
        }
    }
    
    loadCounts() {
        const saved = localStorage.getItem(this.countsKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (error) {
                console.error('加载保存的计数失败:', error);
            }
        }
        return { amitabha: 0 };
    }
    
    saveOfferings(offerings) {
        try {
            localStorage.setItem(this.offeringsKey, JSON.stringify(offerings));
        } catch (error) {
            console.error('保存贡品失败:', error);
        }
    }
    
    loadOfferings() {
        const saved = localStorage.getItem(this.offeringsKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (error) {
                console.error('加载保存的贡品失败:', error);
            }
        }
        return {
            water: 0,
            flower: 0,
            lamp: 0
        };
    }
    
    clearAllData() {
        try {
            localStorage.removeItem(this.countsKey);
            localStorage.removeItem(this.offeringsKey);
        } catch (error) {
            console.error('清除数据失败:', error);
        }
    }
}