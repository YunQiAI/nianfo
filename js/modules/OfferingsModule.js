class OfferingsModule {
    constructor(storageManager, offeringsDisplay) {
        this.storageManager = storageManager;
        this.offeringsDisplay = offeringsDisplay;
        this.offerings = {
            water: 0,
            flower: 0,
            lamp: 0
        };
        
        this.loadOfferings();
    }
    
    addOffering(type) {
        this.offerings[type]++;
        this.updateOfferingsDisplay();
        this.storageManager.saveOfferings(this.offerings);
        this.showOfferingAnimation(type);
    }
    
    updateOfferingsDisplay() {
        this.offeringsDisplay.innerHTML = '';
        
        const order = ['water', 'flower', 'lamp'];
        order.forEach(type => {
            const count = this.offerings[type];
            for (let i = 0; i < count; i++) {
                const offering = document.createElement('div');
                offering.className = `offering-item-display ${type}`;
                offering.innerHTML = this.getOfferingIcon(type);
                this.offeringsDisplay.appendChild(offering);
            }
        });
    }
    
    getOfferingIcon(type) {
        const icons = {
            water: '💧',
            flower: '🌸',
            lamp: '🕯️'
        };
        return icons[type] || '';
    }
    
    showOfferingAnimation(type) {
        const sourceBtn = document.querySelector(`[data-type="${type}"] .btn-offering`);
        const targetAltar = this.offeringsDisplay;
        
        if (sourceBtn && targetAltar) {
            const flyingOffering = document.createElement('div');
            flyingOffering.className = 'flying-offering';
            flyingOffering.innerHTML = this.getOfferingIcon(type);
            
            const sourceRect = sourceBtn.getBoundingClientRect();
            const targetRect = targetAltar.getBoundingClientRect();
            
            flyingOffering.style.position = 'fixed';
            flyingOffering.style.left = sourceRect.left + 'px';
            flyingOffering.style.top = sourceRect.top + 'px';
            flyingOffering.style.fontSize = '2rem';
            flyingOffering.style.zIndex = '1000';
            flyingOffering.style.pointerEvents = 'none';
            
            document.body.appendChild(flyingOffering);
            
            setTimeout(() => {
                flyingOffering.style.transition = 'all 1s ease-out';
                flyingOffering.style.left = targetRect.left + targetRect.width/2 + 'px';
                flyingOffering.style.top = targetRect.top + targetRect.height/2 + 'px';
                flyingOffering.style.transform = 'scale(0.5)';
                flyingOffering.style.opacity = '0';
                
                setTimeout(() => {
                    document.body.removeChild(flyingOffering);
                    this.updateOfferingsDisplay();
                }, 1000);
            }, 100);
        }
    }
    
    loadOfferings() {
        this.offerings = this.storageManager.loadOfferings();
        this.updateOfferingsDisplay();
    }
    
    getOfferings() {
        return { ...this.offerings };
    }
    
    resetOfferings() {
        this.offerings = {
            water: 0,
            flower: 0,
            lamp: 0
        };
        this.updateOfferingsDisplay();
        this.storageManager.saveOfferings(this.offerings);
    }
}