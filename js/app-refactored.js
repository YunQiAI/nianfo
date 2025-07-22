class BuddhistChantCounter {
    constructor() {
        this.eventEmitter = new EventEmitter();
        this.currentMode = 'keyboard';
        this.keyboardMode = 'char';
        this.chantProgress = 0;
        this.focusMode = false;
        this.autoFocusThreshold = 10;
        this.keyboardCooldown = 200;
        this.lastKeyTime = 0;
        this.autoPlayInterval = null;
        
        this.counts = {
            amitabha: 0
        };
        
        this.initializeModules();
        this.setupEventListeners();
        this.attachUIEventListeners();
        this.loadData();
        this.initializeDefaultMode();
    }
    
    initializeModules() {
        this.storageManager = new StorageManager();
        this.uiManager = new UIManager();
        this.audioModule = new AudioModule();
        this.visualEffects = new VisualEffects(this.uiManager.getElement('comboContainer'));
        this.speechRecognition = new SpeechRecognitionModule(this.eventEmitter);
        this.metronome = new MetronomeModule(this.eventEmitter, this.audioModule);
        this.buddhaLight = new BuddhaLightModule(this.eventEmitter, this.audioModule, this.visualEffects);
        this.offerings = new OfferingsModule(this.storageManager, this.uiManager.getElement('offeringsDisplay'));
    }
    
    setupEventListeners() {
        // 语音识别事件
        this.eventEmitter.on('speechStart', () => {
            this.uiManager.updateStatus('正在聆听...', true);
            this.uiManager.updateSpeechButtons(true);
        });
        
        this.eventEmitter.on('speechEnd', () => {
            this.uiManager.updateStatus('已停止', false);
            this.uiManager.updateSpeechButtons(false);
        });
        
        this.eventEmitter.on('speechError', (error) => {
            this.uiManager.updateStatus(`错误: ${error}`, false);
            this.uiManager.updateSpeechButtons(false);
        });
        
        this.eventEmitter.on('chantDetected', (data) => {
            this.handleChantDetected(data);
        });
        
        // 节拍器事件
        this.eventEmitter.on('metronomeStart', (tempo) => {
            this.uiManager.updateStatus(`节拍器运行中 - ${tempo} BPM`, true);
            this.uiManager.updateMetronomeButtons(true);
        });
        
        this.eventEmitter.on('metronomeStop', () => {
            this.uiManager.updateStatus('节拍器已停止', false);
            this.uiManager.updateMetronomeButtons(false);
        });
        
        this.eventEmitter.on('chantCompleted', (data) => {
            this.handleChantCompleted(data);
        });
        
        // 佛光普照事件
        this.eventEmitter.on('buddhaLightStart', (tempo) => {
            this.uiManager.updateStatus(`佛光普照中 - ${tempo} 次/分`, true);
            this.uiManager.updateBuddhaLightButtons(true);
        });
        
        this.eventEmitter.on('buddhaLightStop', () => {
            this.uiManager.updateStatus('佛光普照模式 - 禅修冥想', false);
            this.uiManager.updateBuddhaLightButtons(false);
        });
    }
    
    handleChantDetected(data) {
        this.counts.amitabha++;
        this.uiManager.updateLastChantInfo(data.timestamp, `识别到佛号 +1`);
        this.uiManager.animateCount(this.uiManager.getElement('amitabhaCount'));
        this.visualEffects.showComboEffect();
        this.visualEffects.showBuddhaLight();
        
        if (this.focusMode) {
            this.visualEffects.nourishLotus(this.counts);
        }
        
        this.saveData();
        this.uiManager.updateDisplay(this.counts);
        this.checkAutoFocus();
    }
    
    handleChantCompleted(data) {
        this.counts.amitabha++;
        this.uiManager.updateLastChantInfo(data.timestamp, data.info);
        this.uiManager.animateCount(this.uiManager.getElement('amitabhaCount'));
        this.visualEffects.showComboEffect();
        this.visualEffects.showBuddhaLight();
        
        if (this.focusMode) {
            this.visualEffects.nourishLotus(this.counts);
        }
        
        this.saveData();
        this.uiManager.updateDisplay(this.counts);
        this.checkAutoFocus();
    }
    
    attachUIEventListeners() {
        // 语音识别控制
        this.uiManager.getElement('startBtn').addEventListener('click', () => this.speechRecognition.startListening());
        this.uiManager.getElement('stopBtn').addEventListener('click', () => this.speechRecognition.stopListening());
        
        // 重置按钮
        ['resetBtn', 'resetBtn2', 'resetBtn3', 'resetBtn4'].forEach(btnId => {
            this.uiManager.getElement(btnId).addEventListener('click', () => this.resetCounts());
        });
        
        // 模式切换
        this.uiManager.getElement('speechModeBtn').addEventListener('click', () => this.switchMode('speech'));
        this.uiManager.getElement('keyboardModeBtn').addEventListener('click', () => this.switchMode('keyboard'));
        this.uiManager.getElement('metronomeBtn').addEventListener('click', () => this.switchMode('metronome'));
        this.uiManager.getElement('buddhaLightBtn').addEventListener('click', () => this.switchMode('buddhaLight'));
        
        // 木鱼模式子选项
        this.uiManager.getElement('charModeBtn').addEventListener('click', () => this.switchKeyboardMode('char'));
        this.uiManager.getElement('chantModeBtn').addEventListener('click', () => this.switchKeyboardMode('chant'));
        
        // 节拍器控制
        this.uiManager.getElement('metronomeStartBtn').addEventListener('click', () => this.metronome.startMetronome());
        this.uiManager.getElement('metronomeStopBtn').addEventListener('click', () => this.metronome.stopMetronome());
        this.uiManager.getElement('tempoSlider').addEventListener('input', (e) => {
            const tempo = parseInt(e.target.value);
            this.metronome.updateTempo(tempo);
            this.uiManager.updateTempoValue(tempo);
        });
        
        // 佛光普照控制
        this.uiManager.getElement('buddhaLightStartBtn').addEventListener('click', () => this.buddhaLight.startBuddhaLight());
        this.uiManager.getElement('buddhaLightStopBtn').addEventListener('click', () => this.buddhaLight.stopBuddhaLight());
        this.uiManager.getElement('lightTempoSlider').addEventListener('input', (e) => {
            const tempo = parseInt(e.target.value);
            this.buddhaLight.updateLightTempo(tempo);
            this.uiManager.updateLightTempoValue(tempo);
        });
        this.uiManager.getElement('lightIntensitySlider').addEventListener('input', (e) => {
            const intensity = parseInt(e.target.value);
            this.buddhaLight.updateLightIntensity(intensity);
            this.uiManager.updateLightIntensityValue(intensity);
        });
        this.uiManager.getElement('lotusToggle').addEventListener('change', (e) => {
            this.buddhaLight.toggleLotusEffect(e.target.checked);
        });
        
        // 专注模式
        this.uiManager.getElement('focusBtn').addEventListener('click', () => this.toggleFocusMode());
        
        // 键盘监听
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    handleKeyDown(e) {
        if (this.currentMode !== 'keyboard') return;
        
        if (e.key === 'Tab' || e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta' || e.key === 'Escape') {
            return;
        }
        
        const currentTime = Date.now();
        if (currentTime - this.lastKeyTime < this.keyboardCooldown) {
            return;
        }
        
        this.lastKeyTime = currentTime;
        
        this.audioModule.playWoodenFishSound();
        this.audioModule.recordRhythm();
        
        this.chantProgress++;
        this.uiManager.updateProgress(this.chantProgress);
        
        if (this.chantProgress >= 4) {
            this.counts.amitabha++;
            this.chantProgress = 0;
            
            this.uiManager.animateCount(this.uiManager.getElement('amitabhaCount'));
            this.visualEffects.showComboEffect();
            this.visualEffects.showBuddhaLight();
            this.uiManager.updateProgress(this.chantProgress);
            
            if (this.focusMode) {
                this.visualEffects.nourishLotus(this.counts);
            }
            
            this.saveData();
            this.uiManager.updateDisplay(this.counts);
            
            const timestamp = new Date().toLocaleTimeString('zh-CN');
            this.uiManager.updateLastChantInfo(timestamp, '完成一句佛号 +1');
            
            this.checkAutoFocus();
        } else {
            this.uiManager.updateProgressInfo(`进度: ${this.chantProgress}/4`);
        }
    }
    
    switchMode(mode) {
        this.currentMode = mode;
        
        // 停止所有活动
        if (this.speechRecognition.isRecognitionListening()) {
            this.speechRecognition.stopListening();
        }
        if (this.metronome.isRunning()) {
            this.metronome.stopMetronome();
        }
        if (this.buddhaLight.isRunning()) {
            this.buddhaLight.stopBuddhaLight();
        }
        
        this.uiManager.switchMode(mode);
        
        const statusMessages = {
            'speech': '语音识别模式',
            'keyboard': '木鱼模式 - 按任意键敲击',
            'metronome': '节拍器模式 - 自动念佛',
            'buddhaLight': '佛光普照模式 - 禅修冥想'
        };
        
        this.uiManager.updateStatus(statusMessages[mode] || '', false);
    }
    
    switchKeyboardMode(mode) {
        this.keyboardMode = mode;
        this.chantProgress = 0;
        this.uiManager.switchKeyboardMode(mode);
        this.uiManager.updateProgress(this.chantProgress);
    }
    
    checkAutoFocus() {
        if (this.counts.amitabha >= this.autoFocusThreshold && !this.focusMode) {
            setTimeout(() => {
                if (!this.focusMode) {
                    this.toggleFocusMode();
                }
            }, 1000);
        }
    }
    
    toggleFocusMode() {
        this.focusMode = !this.focusMode;
        
        if (this.focusMode) {
            this.uiManager.enterFocusMode();
            
            if (this.currentMode === 'buddhaLight') {
                this.uiManager.enterBuddhaLightFocus();
            } else {
                this.visualEffects.createLotusFlower();
                this.startAutoPlay();
            }
            
            this.uiManager.createExitFocusButton(() => this.toggleFocusMode());
            document.addEventListener('keydown', this.handleEscapeKey.bind(this));
        } else {
            this.uiManager.exitFocusMode();
            
            if (this.currentMode !== 'buddhaLight') {
                this.stopAutoPlay();
                if (this.metronome.isRunning()) {
                    this.metronome.stopMetronome();
                }
                this.visualEffects.removeLotusFlower();
            }
            
            this.visualEffects.removeLotusCounter();
            this.uiManager.removeExitFocusButton();
            document.removeEventListener('keydown', this.handleEscapeKey.bind(this));
        }
    }
    
    startAutoPlay() {
        const interval = this.audioModule.getAverageInterval() || 1000;
        
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
        
        this.autoPlayInterval = setInterval(() => {
            if (this.focusMode && this.currentMode === 'keyboard') {
                this.simulateKeyPress();
            }
        }, interval);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    simulateKeyPress() {
        this.audioModule.playWoodenFishSound();
        
        this.chantProgress++;
        this.uiManager.updateProgress(this.chantProgress);
        
        if (this.chantProgress >= 4) {
            this.counts.amitabha++;
            this.chantProgress = 0;
            
            this.uiManager.animateCount(this.uiManager.getElement('amitabhaCount'));
            this.visualEffects.showComboEffect();
            this.visualEffects.showBuddhaLight();
            this.uiManager.updateProgress(this.chantProgress);
            
            if (this.focusMode) {
                this.visualEffects.nourishLotus(this.counts);
            }
            
            this.saveData();
            this.uiManager.updateDisplay(this.counts);
            
            const timestamp = new Date().toLocaleTimeString('zh-CN');
            this.uiManager.updateLastChantInfo(timestamp, '自动念佛 +1');
        } else {
            this.uiManager.updateProgressInfo(`进度: ${this.chantProgress}/4`);
        }
    }
    
    handleEscapeKey(e) {
        if (e.key === 'Escape' && this.focusMode) {
            this.toggleFocusMode();
        }
    }
    
    resetCounts() {
        if (confirm('确定要重置所有计数吗？')) {
            if (this.speechRecognition.isRecognitionListening()) {
                this.speechRecognition.stopListening();
            }
            if (this.metronome.isRunning()) {
                this.metronome.stopMetronome();
            }
            
            this.counts = { amitabha: 0 };
            this.chantProgress = 0;
            this.metronome.resetProgress();
            
            this.uiManager.updateProgress(this.chantProgress);
            this.uiManager.clearLastChantInfo();
            this.visualEffects.resetLotusScale();
            
            this.saveData();
            this.uiManager.updateDisplay(this.counts);
        }
    }
    
    initializeDefaultMode() {
        this.switchMode('keyboard');
        this.switchKeyboardMode('char');
    }
    
    loadData() {
        this.counts = this.storageManager.loadCounts();
        this.uiManager.updateDisplay(this.counts);
    }
    
    saveData() {
        this.storageManager.saveCounts(this.counts);
    }
}

// 全局变量供HTML调用
let buddhistCounter;

document.addEventListener('DOMContentLoaded', () => {
    buddhistCounter = new BuddhistChantCounter();
});