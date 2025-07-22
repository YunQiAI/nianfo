class VisualEffects {
    constructor(comboContainer) {
        this.comboContainer = comboContainer;
        this.lotusFlower = null;
        this.lotusCounter = null;
        this.lotusScale = 1;
    }
    
    showComboEffect() {
        const comboElement = document.createElement('div');
        comboElement.className = 'combo-effect';
        comboElement.textContent = `阿弥陀佛`;
        
        const randomOffset = (Math.random() - 0.5) * 100;
        comboElement.style.left = `${randomOffset}px`;
        
        this.comboContainer.appendChild(comboElement);
        
        setTimeout(() => {
            this.nourishLotus();
        }, 3200);
        
        setTimeout(() => {
            if (comboElement.parentNode) {
                comboElement.parentNode.removeChild(comboElement);
            }
        }, 4000);
    }
    
    nourishLotus(counts) {
        if (!this.lotusFlower || !this.lotusFlower.parentNode) {
            this.createLotusFlower();
        }
        
        if (this.lotusFlower && counts) {
            const lotusLevel = ((counts.amitabha - 1) % 1000) + 1;
            this.lotusScale = 1.0 + (lotusLevel - 1) * 0.5 / 999;
            
            this.lotusFlower.style.transform = `translate(-50%, -180px) scale(${this.lotusScale})`;
            
            this.updateLotusCounter(counts);
            
            this.lotusFlower.style.filter = 'brightness(1.5)';
            setTimeout(() => {
                if (this.lotusFlower) {
                    this.lotusFlower.style.filter = 'brightness(1)';
                }
            }, 500);
            
            if (counts.amitabha % 1000 === 0 && counts.amitabha > 0) {
                this.showLotusRebirth();
            }
        }
    }
    
    createLotusFlower() {
        this.lotusFlower = document.createElement('div');
        this.lotusFlower.className = 'lotus-flower';
        this.lotusFlower.innerHTML = `
            <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(40, 40)">
                    <!-- 侧视莲花 - 花瓣垂直向上 -->
                    <!-- 后层花瓣 -->
                    <ellipse cx="0" cy="-15" rx="5" ry="15" fill="#FFB6C1" opacity="0.7"/>
                    <ellipse cx="-7" cy="-12" rx="4" ry="12" fill="#FFB6C1" opacity="0.7" transform="rotate(-15)"/>
                    <ellipse cx="7" cy="-12" rx="4" ry="12" fill="#FFB6C1" opacity="0.7" transform="rotate(15)"/>
                    
                    <!-- 中层花瓣 -->
                    <ellipse cx="-4" cy="-13" rx="4" ry="13" fill="#FFC0CB" opacity="0.85" transform="rotate(-8)"/>
                    <ellipse cx="4" cy="-13" rx="4" ry="13" fill="#FFC0CB" opacity="0.85" transform="rotate(8)"/>
                    
                    <!-- 前层花瓣 -->
                    <ellipse cx="0" cy="-12" rx="5" ry="14" fill="#FFD4DB" opacity="0.9"/>
                    
                    <!-- 花心底部 -->
                    <ellipse cx="0" cy="0" rx="8" ry="3" fill="#FFD700" opacity="0.9"/>
                </g>
            </svg>
        `;
        this.lotusFlower.style.left = '0px';
        this.lotusFlower.style.transform = `translate(-50%, -180px) scale(${this.lotusScale})`;
        
        this.comboContainer.appendChild(this.lotusFlower);
        this.createLotusCounter();
    }
    
    createLotusCounter() {
        this.lotusCounter = document.createElement('div');
        this.lotusCounter.className = 'lotus-counter';
        this.lotusCounter.textContent = `1/1000`;
        this.lotusCounter.style.left = '100px';
        this.lotusCounter.style.transform = 'translate(-50%, -180px)';
        
        this.comboContainer.appendChild(this.lotusCounter);
    }
    
    updateLotusCounter(counts) {
        if (this.lotusCounter && counts) {
            const lotusLevel = ((counts.amitabha - 1) % 1000) + 1;
            this.lotusCounter.textContent = `${lotusLevel}/1000`;
        }
    }
    
    showLotusRebirth() {
        if (this.lotusFlower) {
            this.lotusFlower.style.transition = 'all 1s ease-out';
            this.lotusFlower.style.filter = 'brightness(2) hue-rotate(360deg)';
            
            setTimeout(() => {
                if (this.lotusFlower) {
                    this.lotusFlower.style.filter = 'brightness(1)';
                    this.lotusFlower.style.transition = 'all 0.5s ease-out';
                }
            }, 1000);
        }
    }
    
    showBuddhaLight() {
        const buddhaContainer = document.querySelector('.buddha-image-container');
        const lightElement = document.createElement('div');
        lightElement.className = 'buddha-light';
        
        buddhaContainer.appendChild(lightElement);
        
        setTimeout(() => {
            if (lightElement.parentNode) {
                lightElement.parentNode.removeChild(lightElement);
            }
        }, 3000);
    }
    
    createBuddhaLightLotus() {
        const lotusFlower = document.createElement('div');
        lotusFlower.className = 'lotus-flower';
        lotusFlower.innerHTML = `
            <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(40, 40)">
                    <!-- 侧视莲花 - 花瓣垂直向上 -->
                    <!-- 后层花瓣 -->
                    <ellipse cx="0" cy="-15" rx="5" ry="15" fill="#FFB6C1" opacity="0.7"/>
                    <ellipse cx="-7" cy="-12" rx="4" ry="12" fill="#FFB6C1" opacity="0.7" transform="rotate(-15)"/>
                    <ellipse cx="7" cy="-12" rx="4" ry="12" fill="#FFB6C1" opacity="0.7" transform="rotate(15)"/>
                    
                    <!-- 中层花瓣 -->
                    <ellipse cx="-4" cy="-13" rx="4" ry="13" fill="#FFC0CB" opacity="0.85" transform="rotate(-8)"/>
                    <ellipse cx="4" cy="-13" rx="4" ry="13" fill="#FFC0CB" opacity="0.85" transform="rotate(8)"/>
                    
                    <!-- 前层花瓣 -->
                    <ellipse cx="0" cy="-12" rx="5" ry="14" fill="#FFD4DB" opacity="0.9"/>
                    
                    <!-- 花心底部 -->
                    <ellipse cx="0" cy="0" rx="8" ry="3" fill="#FFD700" opacity="0.9"/>
                </g>
            </svg>
        `;
        lotusFlower.style.left = '0px';
        lotusFlower.style.transform = 'translate(-50%, -180px) scale(1)';
        
        this.comboContainer.appendChild(lotusFlower);
        
        setTimeout(() => {
            if (lotusFlower.parentNode) {
                lotusFlower.parentNode.removeChild(lotusFlower);
            }
        }, 3000);
    }
    
    removeLotusFlower() {
        if (this.lotusFlower && this.lotusFlower.parentNode) {
            this.lotusFlower.parentNode.removeChild(this.lotusFlower);
            this.lotusFlower = null;
        }
    }
    
    removeLotusCounter() {
        if (this.lotusCounter && this.lotusCounter.parentNode) {
            this.lotusCounter.parentNode.removeChild(this.lotusCounter);
            this.lotusCounter = null;
        }
    }
    
    resetLotusScale() {
        this.lotusScale = 1;
        if (this.lotusFlower) {
            this.lotusFlower.style.transform = `translate(-50%, -180px) scale(${this.lotusScale})`;
        }
        if (this.lotusCounter) {
            this.lotusCounter.textContent = '0/1000';
        }
    }
}