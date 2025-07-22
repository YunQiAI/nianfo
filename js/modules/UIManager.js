class UIManager {
    constructor() {
        this.elements = {};
        this.initializeElements();
    }
    
    initializeElements() {
        this.elements = {
            startBtn: document.getElementById('startBtn'),
            stopBtn: document.getElementById('stopBtn'),
            resetBtn: document.getElementById('resetBtn'),
            resetBtn2: document.getElementById('resetBtn2'),
            resetBtn3: document.getElementById('resetBtn3'),
            resetBtn4: document.getElementById('resetBtn4'),
            statusIndicator: document.getElementById('statusIndicator'),
            amitabhaCount: document.getElementById('amitabhaCount'),
            amitabhaLast: document.getElementById('amitabhaLast'),
            recognitionInfo: document.getElementById('recognitionInfo'),
            comboContainer: document.getElementById('comboContainer'),
            speechModeBtn: document.getElementById('speechModeBtn'),
            keyboardModeBtn: document.getElementById('keyboardModeBtn'),
            speechControls: document.getElementById('speechControls'),
            keyboardControls: document.getElementById('keyboardControls'),
            charModeBtn: document.getElementById('charModeBtn'),
            chantModeBtn: document.getElementById('chantModeBtn'),
            keyboardHint: document.getElementById('keyboardHint'),
            keyboardProgress: document.getElementById('keyboardProgress'),
            progressText: document.getElementById('progressText'),
            progressFill: document.getElementById('progressFill'),
            focusBtn: document.getElementById('focusBtn'),
            headerSection: document.getElementById('headerSection'),
            leftPanel: document.getElementById('leftPanel'),
            rightPanel: document.getElementById('rightPanel'),
            metronomeBtn: document.getElementById('metronomeBtn'),
            metronomeControls: document.getElementById('metronomeControls'),
            tempoSlider: document.getElementById('tempoSlider'),
            tempoValue: document.getElementById('tempoValue'),
            metronomeStartBtn: document.getElementById('metronomeStartBtn'),
            metronomeStopBtn: document.getElementById('metronomeStopBtn'),
            offeringsDisplay: document.getElementById('offeringsDisplay'),
            buddhaLightBtn: document.getElementById('buddhaLightBtn'),
            buddhaLightControls: document.getElementById('buddhaLightControls'),
            lightTempoSlider: document.getElementById('lightTempoSlider'),
            lightTempoValue: document.getElementById('lightTempoValue'),
            lightIntensitySlider: document.getElementById('lightIntensitySlider'),
            lightIntensityValue: document.getElementById('lightIntensityValue'),
            lotusToggle: document.getElementById('lotusToggle'),
            buddhaLightStartBtn: document.getElementById('buddhaLightStartBtn'),
            buddhaLightStopBtn: document.getElementById('buddhaLightStopBtn')
        };
    }
    
    updateStatus(text, isActive) {
        this.elements.statusIndicator.textContent = text;
        if (isActive) {
            this.elements.statusIndicator.classList.add('active');
        } else {
            this.elements.statusIndicator.classList.remove('active');
        }
    }
    
    updateDisplay(counts) {
        this.elements.amitabhaCount.textContent = counts.amitabha;
    }
    
    animateCount(element) {
        element.style.color = '#4CAF50';
        setTimeout(() => {
            element.style.color = '#2196F3';
        }, 300);
    }
    
    updateProgress(progress, maxProgress = 4) {
        const percentage = (progress / maxProgress) * 100;
        this.elements.progressText.textContent = `${progress}/${maxProgress}`;
        this.elements.progressFill.style.width = `${percentage}%`;
    }
    
    updateSpeechButtons(isListening) {
        this.elements.startBtn.disabled = isListening;
        this.elements.stopBtn.disabled = !isListening;
    }
    
    updateMetronomeButtons(isRunning) {
        this.elements.metronomeStartBtn.disabled = isRunning;
        this.elements.metronomeStopBtn.disabled = !isRunning;
    }
    
    updateBuddhaLightButtons(isRunning) {
        this.elements.buddhaLightStartBtn.disabled = isRunning;
        this.elements.buddhaLightStopBtn.disabled = !isRunning;
    }
    
    updateTempoValue(tempo) {
        this.elements.tempoValue.textContent = tempo;
    }
    
    updateLightTempoValue(tempo) {
        this.elements.lightTempoValue.textContent = tempo;
    }
    
    updateLightIntensityValue(intensity) {
        this.elements.lightIntensityValue.textContent = intensity;
    }
    
    switchMode(mode) {
        // 重置按钮状态
        this.elements.speechModeBtn.classList.remove('active');
        this.elements.keyboardModeBtn.classList.remove('active');
        this.elements.metronomeBtn.classList.remove('active');
        this.elements.buddhaLightBtn.classList.remove('active');
        
        // 隐藏所有控制面板
        this.elements.speechControls.style.display = 'none';
        this.elements.keyboardControls.style.display = 'none';
        this.elements.metronomeControls.style.display = 'none';
        this.elements.buddhaLightControls.style.display = 'none';
        
        if (mode === 'speech') {
            this.elements.speechModeBtn.classList.add('active');
            this.elements.speechControls.style.display = 'flex';
        } else if (mode === 'keyboard') {
            this.elements.keyboardModeBtn.classList.add('active');
            this.elements.keyboardControls.style.display = 'flex';
        } else if (mode === 'metronome') {
            this.elements.metronomeBtn.classList.add('active');
            this.elements.metronomeControls.style.display = 'flex';
        } else if (mode === 'buddhaLight') {
            this.elements.buddhaLightBtn.classList.add('active');
            this.elements.buddhaLightControls.style.display = 'flex';
        }
    }
    
    switchKeyboardMode(mode) {
        if (mode === 'char') {
            this.elements.charModeBtn.classList.add('active');
            this.elements.chantModeBtn.classList.remove('active');
            this.elements.keyboardHint.textContent = '按4个字符念一句佛号';
            this.elements.keyboardProgress.style.display = 'block';
        } else {
            this.elements.charModeBtn.classList.remove('active');
            this.elements.chantModeBtn.classList.add('active');
            this.elements.keyboardHint.textContent = '按4个字符念一句佛号';
            this.elements.keyboardProgress.style.display = 'block';
        }
    }
    
    updateLastChantInfo(timestamp, info) {
        this.elements.amitabhaLast.textContent = `最后识别: ${timestamp}`;
        this.elements.recognitionInfo.textContent = info;
    }
    
    updateProgressInfo(info) {
        this.elements.recognitionInfo.textContent = info;
    }
    
    clearLastChantInfo() {
        this.elements.amitabhaLast.textContent = '';
        this.elements.recognitionInfo.textContent = '';
    }
    
    enterFocusMode() {
        document.body.classList.add('focus-mode');
    }
    
    exitFocusMode() {
        document.body.classList.remove('focus-mode');
        document.body.classList.remove('buddha-light-focus');
    }
    
    enterBuddhaLightFocus() {
        document.body.classList.add('buddha-light-focus');
    }
    
    createExitFocusButton(callback) {
        const exitBtn = document.createElement('button');
        exitBtn.textContent = '退出专注';
        exitBtn.className = 'exit-focus';
        exitBtn.id = 'exitFocusBtn';
        exitBtn.addEventListener('click', callback);
        document.body.appendChild(exitBtn);
        return exitBtn;
    }
    
    removeExitFocusButton() {
        const exitBtn = document.getElementById('exitFocusBtn');
        if (exitBtn) {
            exitBtn.remove();
        }
    }
    
    getElement(name) {
        return this.elements[name];
    }
}