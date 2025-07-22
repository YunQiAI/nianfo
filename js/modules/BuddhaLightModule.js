class BuddhaLightModule {
    constructor(eventEmitter, audioModule, visualEffects) {
        this.eventEmitter = eventEmitter;
        this.audioModule = audioModule;
        this.visualEffects = visualEffects;
        this.buddhaLightInterval = null;
        this.isBuddhaLightRunning = false;
        this.lightTempo = 30;
        this.lightIntensity = 80;
        this.lotusEnabled = true;
    }
    
    startBuddhaLight() {
        if (this.isBuddhaLightRunning) {
            return;
        }
        
        this.isBuddhaLightRunning = true;
        this.eventEmitter.emit('buddhaLightStart', this.lightTempo);
        
        const interval = (60 / this.lightTempo) * 1000;
        
        this.buddhaLightInterval = setInterval(() => {
            this.visualEffects.showBuddhaLight();
            
            if (this.lotusEnabled) {
                this.visualEffects.createBuddhaLightLotus();
            }
            
            this.audioModule.playWoodenFishSound();
        }, interval);
        
        console.log(`佛光普照启动，频率: ${this.lightTempo} 次/分，间隔: ${interval}ms`);
    }
    
    stopBuddhaLight() {
        if (!this.isBuddhaLightRunning) {
            return;
        }
        
        this.isBuddhaLightRunning = false;
        this.eventEmitter.emit('buddhaLightStop');
        
        if (this.buddhaLightInterval) {
            clearInterval(this.buddhaLightInterval);
            this.buddhaLightInterval = null;
        }
        
        console.log('佛光普照停止');
    }
    
    updateLightTempo(tempo) {
        this.lightTempo = tempo;
        
        if (this.isBuddhaLightRunning) {
            this.stopBuddhaLight();
            setTimeout(() => this.startBuddhaLight(), 100);
        }
    }
    
    updateLightIntensity(intensity) {
        this.lightIntensity = intensity;
    }
    
    toggleLotusEffect(enabled) {
        this.lotusEnabled = enabled;
    }
    
    getLightTempo() {
        return this.lightTempo;
    }
    
    getLightIntensity() {
        return this.lightIntensity;
    }
    
    isLotusEnabled() {
        return this.lotusEnabled;
    }
    
    isRunning() {
        return this.isBuddhaLightRunning;
    }
}