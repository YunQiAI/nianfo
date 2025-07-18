class BuddhistChantCounter {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.currentMode = 'speech'; // 'speech' 或 'keyboard'
        this.counts = {
            amitabha: 0
        };
        
        this.chantPatterns = {
            amitabha: /阿弥陀佛|阿弥陀|南无阿弥陀佛|南无阿弥陀/i
        };
        
        this.interimBuffer = '';
        this.bufferTimeout = null;
        this.lastCountTime = 0;
        this.cooldownPeriod = 1000; // 防重复计数冷却时间（毫秒）
        this.processedPhrases = new Set();
        this.lastProcessedText = '';
        this.keyboardCooldown = 200; // 键盘模式冷却时间（毫秒）
        this.lastKeyTime = 0;
        
        this.initializeElements();
        this.loadCounts();
        this.initializeSpeechRecognition();
        this.attachEventListeners();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.elements = {
            startBtn: document.getElementById('startBtn'),
            stopBtn: document.getElementById('stopBtn'),
            resetBtn: document.getElementById('resetBtn'),
            resetBtn2: document.getElementById('resetBtn2'),
            statusIndicator: document.getElementById('statusIndicator'),
            amitabhaCount: document.getElementById('amitabhaCount'),
            amitabhaLast: document.getElementById('amitabhaLast'),
            recognitionInfo: document.getElementById('recognitionInfo'),
            comboContainer: document.getElementById('comboContainer'),
            speechModeBtn: document.getElementById('speechModeBtn'),
            keyboardModeBtn: document.getElementById('keyboardModeBtn'),
            speechControls: document.getElementById('speechControls'),
            keyboardControls: document.getElementById('keyboardControls')
        };
    }
    
    initializeSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('您的浏览器不支持语音识别功能。请使用最新版本的Chrome、Edge或Safari浏览器。');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.lang = 'zh-CN';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3;
        
        this.lastInterimText = '';
        this.processedText = new Set();
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateStatus('正在聆听...', true);
            this.elements.startBtn.disabled = true;
            this.elements.stopBtn.disabled = false;
            this.processedText.clear();
            this.processedPhrases.clear();
            this.lastProcessedText = '';
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateStatus('已停止', false);
            this.elements.startBtn.disabled = false;
            this.elements.stopBtn.disabled = true;
            
            if (this.shouldRestart) {
                this.shouldRestart = false;
                setTimeout(() => this.startListening(), 100);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('语音识别错误:', event.error);
            
            if (event.error === 'no-speech') {
                this.updateStatus('未检测到语音，请继续念诵', true);
                return;
            }
            
            if (event.error === 'aborted') {
                return;
            }
            
            this.updateStatus(`错误: ${event.error}`, false);
            this.isListening = false;
            this.elements.startBtn.disabled = false;
            this.elements.stopBtn.disabled = true;
        };
        
        this.recognition.onresult = (event) => {
            const results = event.results;
            
            for (let i = event.resultIndex; i < results.length; i++) {
                const transcript = results[i][0].transcript.trim();
                
                if (results[i].isFinal) {
                    if (transcript && !this.processedText.has(transcript)) {
                        this.processedText.add(transcript);
                        this.processContinuousText(transcript);
                    }
                    this.lastInterimText = '';
                } else {
                    // 处理中间结果，提高响应速度
                    if (transcript !== this.lastInterimText) {
                        this.lastInterimText = transcript;
                        
                        // 清除之前的超时
                        if (this.bufferTimeout) {
                            clearTimeout(this.bufferTimeout);
                        }
                        
                        // 累积缓冲区
                        this.interimBuffer = transcript;
                        
                        // 设置短暂延迟后处理，避免过于频繁
                        this.bufferTimeout = setTimeout(() => {
                            if (this.interimBuffer && this.interimBuffer.length >= 4) {
                                this.processInterimText(this.interimBuffer);
                                this.interimBuffer = '';
                            }
                        }, 500);
                    }
                }
            }
        };
    }
    
    processContinuousText(text) {
        const timestamp = new Date().toLocaleTimeString('zh-CN');
        const currentTime = Date.now();
        
        // 避免处理相同的文本
        if (text === this.lastProcessedText || this.processedPhrases.has(text)) {
            return;
        }
        
        // 简化识别逻辑：只检查是否包含"阿弥陀佛"，每次只+1
        if (this.chantPatterns.amitabha.test(text)) {
            // 检查冷却时间，避免重复计数
            if (currentTime - this.lastCountTime >= this.cooldownPeriod) {
                this.counts.amitabha++;
                this.lastCountTime = currentTime;
                this.elements.amitabhaLast.textContent = `最后识别: ${timestamp}`;
                this.elements.recognitionInfo.textContent = `识别到佛号 +1`;
                this.animateCount(this.elements.amitabhaCount);
                this.showComboEffect();
                
                this.saveCounts();
                this.updateDisplay();
            }
        }
        
        // 记录已处理的文本
        this.processedPhrases.add(text);
        this.lastProcessedText = text;
        
        // 清理旧的已处理文本记录，避免内存泄漏
        if (this.processedPhrases.size > 100) {
            const oldestItems = Array.from(this.processedPhrases).slice(0, 50);
            oldestItems.forEach(item => this.processedPhrases.delete(item));
        }
    }
    
    processInterimText(text) {
        // 简化中间结果处理，避免过度计数
        const currentTime = Date.now();
        
        // 只有在冷却时间外且文本明确包含"阿弥陀佛"时才处理
        if (this.chantPatterns.amitabha.test(text) && 
            currentTime - this.lastCountTime >= this.cooldownPeriod &&
            !this.processedPhrases.has(text)) {
            
            const timestamp = new Date().toLocaleTimeString('zh-CN');
            this.counts.amitabha++;
            this.lastCountTime = currentTime;
            this.elements.amitabhaLast.textContent = `最后识别: ${timestamp}`;
            this.elements.recognitionInfo.textContent = `识别到佛号 +1`;
            this.animateCount(this.elements.amitabhaCount);
            this.showComboEffect();
            
            this.processedPhrases.add(text);
            this.saveCounts();
            this.updateDisplay();
        }
    }
    
    splitChants(text) {
        // 使用多种分割策略
        let chants = [];
        
        // 策略1: 按照完整的佛号进行分割
        const patterns = [
            /阿弥陀佛/g,
            /南无阿弥陀佛/g,
            /观世音菩萨/g,
            /观音菩萨/g,
            /南无观世音菩萨/g,
            /释迦牟尼佛/g,
            /药师佛/g,
            /地藏菩萨/g,
            /文殊菩萨/g,
            /普贤菩萨/g
        ];
        
        let remaining = text;
        patterns.forEach(pattern => {
            const matches = remaining.match(pattern);
            if (matches) {
                chants = chants.concat(matches);
                remaining = remaining.replace(pattern, ' ');
            }
        });
        
        // 策略2: 处理可能的语音识别连接
        // 例如："阿弥陀佛阿弥陀佛" -> ["阿弥陀佛", "阿弥陀佛"]
        if (chants.length === 0 && remaining.trim()) {
            const possibleChants = remaining.match(/(.{3,6})\1+/g);
            if (possibleChants) {
                possibleChants.forEach(repeated => {
                    const unit = repeated.match(/^(.{3,6})/)[1];
                    const count = repeated.length / unit.length;
                    for (let i = 0; i < count; i++) {
                        chants.push(unit);
                    }
                });
            }
        }
        
        return chants.length > 0 ? chants : [text];
    }
    
    isCompleteChant(text) {
        // 检查是否是完整的佛号
        return text.length >= 3 && (
            text === '阿弥陀佛' ||
            text === '南无阿弥陀佛' ||
            text === '观世音菩萨' ||
            text === '观音菩萨' ||
            text === '南无观世音菩萨' ||
            text.endsWith('佛') ||
            text.endsWith('菩萨')
        );
    }
    
    recognizeAndCount(chant, timestamp) {
        if (this.chantPatterns.amitabha.test(chant)) {
            this.counts.amitabha++;
            this.elements.amitabhaLast.textContent = `最后识别: ${timestamp}`;
            this.animateCount(this.elements.amitabhaCount);
            return true;
        }
        
        return false;
    }
    
    animateCount(element) {
        element.style.transform = 'scale(1.2)';
        element.style.color = '#4CAF50';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '#2196F3';
        }, 300);
    }
    
    showComboEffect() {
        const comboElement = document.createElement('div');
        comboElement.className = 'combo-effect';
        comboElement.textContent = `阿弥陀佛 × ${this.counts.amitabha}`;
        
        // 随机位置偏移，让特效更自然
        const randomOffset = (Math.random() - 0.5) * 100;
        comboElement.style.left = `${randomOffset}px`;
        
        this.elements.comboContainer.appendChild(comboElement);
        
        // 动画完成后移除元素
        setTimeout(() => {
            if (comboElement.parentNode) {
                comboElement.parentNode.removeChild(comboElement);
            }
        }, 2000);
    }
    
    switchMode(mode) {
        this.currentMode = mode;
        
        if (mode === 'speech') {
            this.elements.speechModeBtn.classList.add('active');
            this.elements.keyboardModeBtn.classList.remove('active');
            this.elements.speechControls.style.display = 'flex';
            this.elements.keyboardControls.style.display = 'none';
            this.updateStatus('准备就绪', false);
        } else {
            this.elements.speechModeBtn.classList.remove('active');
            this.elements.keyboardModeBtn.classList.add('active');
            this.elements.speechControls.style.display = 'none';
            this.elements.keyboardControls.style.display = 'flex';
            this.updateStatus('木鱼模式 - 按任意键敲击', false);
            
            // 如果正在语音识别，先停止
            if (this.isListening) {
                this.stopListening();
            }
        }
    }
    
    handleKeyDown(e) {
        if (this.currentMode !== 'keyboard') return;
        
        // 忽略功能键
        if (e.key === 'Tab' || e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') {
            return;
        }
        
        // 防止过快连击
        const currentTime = Date.now();
        if (currentTime - this.lastKeyTime < this.keyboardCooldown) {
            return;
        }
        
        this.lastKeyTime = currentTime;
        this.counts.amitabha++;
        
        // 视觉反馈
        this.animateCount(this.elements.amitabhaCount);
        this.showComboEffect();
        this.flashBuddhaImage();
        
        // 更新显示
        this.saveCounts();
        this.updateDisplay();
        
        // 更新状态
        this.elements.recognitionInfo.textContent = `键盘敲击 +1`;
        this.elements.amitabhaLast.textContent = `最后敲击: ${new Date().toLocaleTimeString('zh-CN')}`;
    }
    
    flashBuddhaImage() {
        const buddhaImage = document.querySelector('.buddha-image');
        buddhaImage.classList.add('keyboard-active');
        setTimeout(() => {
            buddhaImage.classList.remove('keyboard-active');
        }, 150);
    }
    
    attachEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startListening());
        this.elements.stopBtn.addEventListener('click', () => this.stopListening());
        this.elements.resetBtn.addEventListener('click', () => this.resetCounts());
        this.elements.resetBtn2.addEventListener('click', () => this.resetCounts());
        
        // 模式切换
        this.elements.speechModeBtn.addEventListener('click', () => this.switchMode('speech'));
        this.elements.keyboardModeBtn.addEventListener('click', () => this.switchMode('keyboard'));
        
        // 键盘监听
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    startListening() {
        if (!this.recognition) {
            alert('语音识别功能不可用');
            return;
        }
        
        if (this.isListening) {
            return;
        }
        
        try {
            this.shouldRestart = true;
            this.recognition.start();
        } catch (error) {
            console.error('启动语音识别失败:', error);
            this.updateStatus('启动失败，请重试', false);
        }
    }
    
    stopListening() {
        if (!this.isListening) {
            return;
        }
        
        this.shouldRestart = false;
        this.recognition.stop();
    }
    
    resetCounts() {
        if (confirm('确定要重置所有计数吗？')) {
            this.counts = {
                amitabha: 0
            };
            
            this.elements.amitabhaLast.textContent = '';
            this.elements.recognitionInfo.textContent = '';
            
            this.saveCounts();
            this.updateDisplay();
        }
    }
    
    updateStatus(text, isActive) {
        this.elements.statusIndicator.textContent = text;
        if (isActive) {
            this.elements.statusIndicator.classList.add('active');
        } else {
            this.elements.statusIndicator.classList.remove('active');
        }
    }
    
    updateDisplay() {
        this.elements.amitabhaCount.textContent = this.counts.amitabha;
    }
    
    saveCounts() {
        localStorage.setItem('buddhistChantCounts', JSON.stringify(this.counts));
    }
    
    loadCounts() {
        const saved = localStorage.getItem('buddhistChantCounts');
        if (saved) {
            try {
                this.counts = JSON.parse(saved);
            } catch (error) {
                console.error('加载保存的计数失败:', error);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BuddhistChantCounter();
});