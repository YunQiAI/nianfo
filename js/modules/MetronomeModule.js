class MetronomeModule {
    constructor(eventEmitter, audioModule) {
        this.eventEmitter = eventEmitter;
        this.audioModule = audioModule;
        this.metronomeInterval = null;
        this.isMetronomeRunning = false;
        this.currentTempo = 240;
        this.chantProgress = 0;
    }
    
    startMetronome() {
        if (this.isMetronomeRunning) return;
        
        this.isMetronomeRunning = true;
        this.eventEmitter.emit('metronomeStart', this.currentTempo);
        
        const interval = (60 / this.currentTempo) * 1000;
        
        this.metronomeInterval = setInterval(() => {
            this.metronomeHit();
        }, interval);
        
        console.log(`节拍器启动，BPM: ${this.currentTempo}，间隔: ${interval}ms`);
    }
    
    stopMetronome() {
        if (!this.isMetronomeRunning) return;
        
        this.isMetronomeRunning = false;
        this.eventEmitter.emit('metronomeStop');
        
        if (this.metronomeInterval) {
            clearInterval(this.metronomeInterval);
            this.metronomeInterval = null;
        }
        
        console.log('节拍器停止');
    }
    
    metronomeHit() {
        this.audioModule.playWoodenFishSound();
        
        this.chantProgress++;
        
        if (this.chantProgress >= 4) {
            this.chantProgress = 0;
            
            const timestamp = new Date().toLocaleTimeString('zh-CN');
            this.eventEmitter.emit('chantCompleted', {
                type: 'metronome',
                timestamp: timestamp,
                info: '节拍器念佛 +1'
            });
        }
    }
    
    updateTempo(tempo) {
        this.currentTempo = tempo;
        
        if (this.isMetronomeRunning) {
            this.stopMetronome();
            setTimeout(() => {
                this.startMetronome();
            }, 100);
        }
    }
    
    getCurrentTempo() {
        return this.currentTempo;
    }
    
    isRunning() {
        return this.isMetronomeRunning;
    }
    
    getChantProgress() {
        return this.chantProgress;
    }
    
    resetProgress() {
        this.chantProgress = 0;
    }
}