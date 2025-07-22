class AudioModule {
    constructor() {
        this.audioContext = null;
        this.audioBuffer = null;
        this.rhythmRecord = [];
        this.averageInterval = 1000;
        
        this.initializeAudio();
    }
    
    initializeAudio() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.loadWoodenFishAudio();
    }
    
    async loadWoodenFishAudio() {
        try {
            const response = await fetch('wooden-fish.m4a');
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                if (arrayBuffer.byteLength > 0) {
                    this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                    console.log('✅ 木鱼音效文件加载成功');
                    return;
                }
            }
            console.error('❌ 木鱼音效文件加载失败');
        } catch (error) {
            console.error('❌ 木鱼音效文件加载失败:', error);
        }
        
        console.warn('尝试使用内置木鱼音效...');
        if (typeof WOODEN_FISH_AUDIO_DATA !== 'undefined') {
            this.audioBuffer = WOODEN_FISH_AUDIO_DATA.generateAudioBuffer(this.audioContext);
            console.log('✅ 内置木鱼音效加载成功');
        } else {
            console.error('❌ 内置音效数据不可用');
        }
    }
    
    generateBuiltinAudioBuffer() {
        try {
            const sampleRate = this.audioContext.sampleRate;
            const duration = 0.43;
            const length = sampleRate * duration;
            
            const audioBuffer = this.audioContext.createBuffer(2, length, sampleRate);
            const leftChannel = audioBuffer.getChannelData(0);
            const rightChannel = audioBuffer.getChannelData(1);
            
            for (let i = 0; i < length; i++) {
                const t = i / sampleRate;
                
                let sample = 0;
                
                sample += 0.6 * Math.sin(2 * Math.PI * 450 * t);
                sample += 0.4 * Math.sin(2 * Math.PI * 900 * t);
                sample += 0.25 * Math.sin(2 * Math.PI * 1350 * t);
                sample += 0.15 * Math.sin(2 * Math.PI * 1800 * t);
                sample += 0.1 * Math.sin(2 * Math.PI * 2700 * t);
                sample += 0.2 * Math.sin(2 * Math.PI * 225 * t);
                
                if (t < 0.005) {
                    sample += 0.3 * (Math.random() * 2 - 1) * Math.exp(-t * 1000);
                }
                
                sample += 0.02 * (Math.random() * 2 - 1) * Math.exp(-t * 12);
                
                let envelope;
                if (t < 0.002) {
                    envelope = t / 0.002;
                } else if (t < 0.02) {
                    envelope = 1.0 * Math.exp(-(t - 0.002) * 25);
                } else {
                    envelope = 0.6 * Math.exp(-(t - 0.02) * 6);
                }
                
                const finalSample = sample * envelope * 0.15;
                
                leftChannel[i] = finalSample * (1 + 0.05 * Math.sin(2 * Math.PI * 3 * t));
                rightChannel[i] = finalSample * (1 - 0.05 * Math.sin(2 * Math.PI * 3 * t));
            }
            
            this.audioBuffer = audioBuffer;
            console.log('使用高仿真木鱼音效 - 基于真实音频特征合成');
        } catch (error) {
            console.log('内置音效生成失败:', error);
        }
    }
    
    playWoodenFishSound() {
        if (!this.audioContext) return;
        
        if (this.audioBuffer) {
            this.playAudioBuffer();
        } else {
            console.warn('音效文件未加载，使用合成音效');
            this.playSynthesizedSound();
        }
    }
    
    playSynthesizedSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.frequency.setValueAtTime(520, this.audioContext.currentTime);
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    playAudioBuffer() {
        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.audioBuffer;
            gainNode.gain.setValueAtTime(0.8, this.audioContext.currentTime);
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const duration = 0.4;
            source.start(this.audioContext.currentTime, 0, duration);
            
            console.log('播放木鱼音效，时长:', duration, '秒');
        } catch (error) {
            console.error('播放音效失败:', error);
        }
    }
    
    recordRhythm() {
        const now = Date.now();
        
        this.rhythmRecord.push(now);
        
        if (this.rhythmRecord.length > 20) {
            this.rhythmRecord.shift();
        }
        
        if (this.rhythmRecord.length >= 2) {
            let totalInterval = 0;
            for (let i = 1; i < this.rhythmRecord.length; i++) {
                totalInterval += this.rhythmRecord[i] - this.rhythmRecord[i-1];
            }
            this.averageInterval = totalInterval / (this.rhythmRecord.length - 1);
        }
    }
    
    getAverageInterval() {
        return this.averageInterval;
    }
}