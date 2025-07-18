class BuddhistChantCounter {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.currentMode = 'keyboard'; // 'speech' 或 'keyboard'
        this.keyboardMode = 'char'; // 'char' 或 'chant'
        this.chantProgress = 0; // 佛号进度 (0-4)
        this.focusMode = false; // 专注模式
        this.autoFocusThreshold = 10; // 自动专注阈值
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
        this.lotusFlower = null; // 莲花元素
        this.lotusScale = 1; // 莲花当前缩放比例
        this.lotusCounter = null; // 莲花计数器
        
        this.initializeElements();
        this.loadCounts();
        this.initializeSpeechRecognition();
        this.attachEventListeners();
        this.updateDisplay();
        this.initializeDefaultMode();
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
            rightPanel: document.getElementById('rightPanel')
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
                this.showBuddhaLight();
                
                this.saveCounts();
                this.updateDisplay();
                
                // 检查是否需要自动进入专注模式
                this.checkAutoFocus();
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
            this.showBuddhaLight();
            
            this.processedPhrases.add(text);
            this.saveCounts();
            this.updateDisplay();
            
            // 检查是否需要自动进入专注模式
            this.checkAutoFocus();
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
        element.style.color = '#4CAF50';
        setTimeout(() => {
            element.style.color = '#2196F3';
        }, 300);
    }
    
    showComboEffect() {
        const comboElement = document.createElement('div');
        comboElement.className = 'combo-effect';
        comboElement.textContent = `阿弥陀佛`;
        
        // 随机位置偏移，让特效更自然
        const randomOffset = (Math.random() - 0.5) * 100;
        comboElement.style.left = `${randomOffset}px`;
        
        this.elements.comboContainer.appendChild(comboElement);
        
        // 3.2秒后滋养莲花（佛号到达佛顶时）
        setTimeout(() => {
            this.nourishLotus();
        }, 3200);
        
        // 动画完成后移除佛号元素
        setTimeout(() => {
            if (comboElement.parentNode) {
                comboElement.parentNode.removeChild(comboElement);
            }
        }, 4000);
    }
    
    nourishLotus() {
        // 只在专注模式下才滋养莲花
        if (!this.focusMode) {
            return;
        }
        
        // 如果莲花不存在，创建一朵新莲花
        if (!this.lotusFlower || !this.lotusFlower.parentNode) {
            this.createLotusFlower();
        }
        
        // 滋养莲花，让它永久长大一点
        if (this.lotusFlower) {
            // 计算莲花等级 (1-1000级循环)
            const lotusLevel = ((this.counts.amitabha - 1) % 1000) + 1;
            
            // 根据等级计算缩放比例 (1.0 到 1.5)
            this.lotusScale = 1.0 + (lotusLevel - 1) * 0.5 / 999;
            
            this.lotusFlower.style.transform = `translate(-50%, -180px) scale(${this.lotusScale})`;
            
            // 更新莲花计数器
            this.updateLotusCounter();
            
            // 添加短暂的闪烁效果表示被滋养
            this.lotusFlower.style.filter = 'brightness(1.5)';
            setTimeout(() => {
                if (this.lotusFlower) {
                    this.lotusFlower.style.filter = 'brightness(1)';
                }
            }, 500);
            
            // 如果达到1000级，显示特殊效果
            if (this.counts.amitabha % 1000 === 0 && this.counts.amitabha > 0) {
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
        this.lotusFlower.style.left = '0px'; // 居中位置
        this.lotusFlower.style.transform = `translate(-50%, -180px) scale(${this.lotusScale})`;
        
        this.elements.comboContainer.appendChild(this.lotusFlower);
        
        // 创建莲花计数器
        this.createLotusCounter();
    }
    
    createLotusCounter() {
        this.lotusCounter = document.createElement('div');
        this.lotusCounter.className = 'lotus-counter';
        const lotusLevel = ((this.counts.amitabha - 1) % 1000) + 1;
        this.lotusCounter.textContent = `${lotusLevel}/1000`;
        this.lotusCounter.style.left = '100px'; // 莲花右侧远一些
        this.lotusCounter.style.transform = 'translate(-50%, -180px)';
        
        this.elements.comboContainer.appendChild(this.lotusCounter);
    }
    
    updateLotusCounter() {
        if (this.lotusCounter) {
            const lotusLevel = ((this.counts.amitabha - 1) % 1000) + 1;
            this.lotusCounter.textContent = `${lotusLevel}/1000`;
        }
    }
    
    initializeDefaultMode() {
        this.updateStatus('木鱼模式 - 按任意键敲击', false);
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
    
    switchKeyboardMode(mode) {
        this.keyboardMode = mode;
        this.chantProgress = 0; // 重置进度
        
        if (mode === 'char') {
            this.elements.charModeBtn.classList.add('active');
            this.elements.chantModeBtn.classList.remove('active');
            this.elements.keyboardHint.textContent = '按4个字符念一句佛号';
            this.elements.keyboardProgress.style.display = 'block';
            this.updateProgress();
        } else {
            this.elements.charModeBtn.classList.remove('active');
            this.elements.chantModeBtn.classList.add('active');
            this.elements.keyboardHint.textContent = '按4个字符念一句佛号';
            this.elements.keyboardProgress.style.display = 'block';
            this.updateProgress();
        }
    }
    
    updateProgress() {
        const percentage = (this.chantProgress / 4) * 100;
        this.elements.progressText.textContent = `${this.chantProgress}/4`;
        this.elements.progressFill.style.width = `${percentage}%`;
    }
    
    handleKeyDown(e) {
        if (this.currentMode !== 'keyboard') return;
        
        // 忽略功能键
        if (e.key === 'Tab' || e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta' || e.key === 'Escape') {
            return;
        }
        
        // 防止过快连击
        const currentTime = Date.now();
        if (currentTime - this.lastKeyTime < this.keyboardCooldown) {
            return;
        }
        
        this.lastKeyTime = currentTime;
        
        // 两种模式都是按4个字符念一句佛号
        this.chantProgress++;
        this.updateProgress();
        this.flashBuddhaImage();
        
        if (this.chantProgress >= 4) {
            this.counts.amitabha++;
            this.chantProgress = 0;
            
            // 视觉反馈
            this.animateCount(this.elements.amitabhaCount);
            this.showComboEffect();
            this.showBuddhaLight();
            this.updateProgress();
            
            // 更新显示
            this.saveCounts();
            this.updateDisplay();
            
            // 更新状态
            if (this.keyboardMode === 'char') {
                this.elements.recognitionInfo.textContent = `完成一句佛号 +1`;
                this.elements.amitabhaLast.textContent = `最后完成: ${new Date().toLocaleTimeString('zh-CN')}`;
            } else {
                this.elements.recognitionInfo.textContent = `完成一句佛号 +1`;
                this.elements.amitabhaLast.textContent = `最后完成: ${new Date().toLocaleTimeString('zh-CN')}`;
            }
            
            // 检查是否需要自动进入专注模式
            this.checkAutoFocus();
        } else {
            // 更新状态
            this.elements.recognitionInfo.textContent = `进度: ${this.chantProgress}/4`;
        }
    }
    
    flashBuddhaImage() {
        // 移除佛像闪烁效果，保持庄严静止
    }
    
    showLotusRebirth() {
        // 莲花重生特效
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
        
        // 动画完成后移除元素
        setTimeout(() => {
            if (lightElement.parentNode) {
                lightElement.parentNode.removeChild(lightElement);
            }
        }, 3000);
    }
    
    checkAutoFocus() {
        // 念佛达到阈值且未在专注模式时自动进入
        if (this.counts.amitabha >= this.autoFocusThreshold && !this.focusMode) {
            // 延迟1秒后自动进入专注模式
            setTimeout(() => {
                if (!this.focusMode) { // 再次检查避免重复进入
                    this.toggleFocusMode();
                }
            }, 1000);
        }
    }
    
    toggleFocusMode() {
        this.focusMode = !this.focusMode;
        
        if (this.focusMode) {
            document.body.classList.add('focus-mode');
            
            // 进入专注模式时创建莲花
            if (!this.lotusFlower || !this.lotusFlower.parentNode) {
                this.createLotusFlower();
            }
            
            // 创建退出按钮
            const exitBtn = document.createElement('button');
            exitBtn.textContent = '退出专注';
            exitBtn.className = 'exit-focus';
            exitBtn.id = 'exitFocusBtn';
            exitBtn.addEventListener('click', () => this.toggleFocusMode());
            document.body.appendChild(exitBtn);
            
            // 在专注模式下，ESC键退出
            document.addEventListener('keydown', this.handleEscapeKey.bind(this));
        } else {
            document.body.classList.remove('focus-mode');
            
            // 退出专注模式时移除莲花
            if (this.lotusFlower && this.lotusFlower.parentNode) {
                this.lotusFlower.parentNode.removeChild(this.lotusFlower);
                this.lotusFlower = null;
            }
            if (this.lotusCounter && this.lotusCounter.parentNode) {
                this.lotusCounter.parentNode.removeChild(this.lotusCounter);
                this.lotusCounter = null;
            }
            
            // 移除退出按钮
            const exitBtn = document.getElementById('exitFocusBtn');
            if (exitBtn) {
                exitBtn.remove();
            }
            
            // 移除ESC键监听
            document.removeEventListener('keydown', this.handleEscapeKey.bind(this));
        }
    }
    
    handleEscapeKey(e) {
        if (e.key === 'Escape' && this.focusMode) {
            this.toggleFocusMode();
        }
    }
    
    attachEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startListening());
        this.elements.stopBtn.addEventListener('click', () => this.stopListening());
        this.elements.resetBtn.addEventListener('click', () => this.resetCounts());
        this.elements.resetBtn2.addEventListener('click', () => this.resetCounts());
        
        // 模式切换
        this.elements.speechModeBtn.addEventListener('click', () => this.switchMode('speech'));
        this.elements.keyboardModeBtn.addEventListener('click', () => this.switchMode('keyboard'));
        
        // 木鱼模式子选项
        this.elements.charModeBtn.addEventListener('click', () => this.switchKeyboardMode('char'));
        this.elements.chantModeBtn.addEventListener('click', () => this.switchKeyboardMode('chant'));
        
        // 专注模式
        this.elements.focusBtn.addEventListener('click', () => this.toggleFocusMode());
        
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
            
            // 重置莲花大小
            this.lotusScale = 1;
            
            // 如果在专注模式且莲花存在，更新其大小和计数
            if (this.focusMode && this.lotusFlower) {
                this.lotusFlower.style.transform = `translate(-50%, -180px) scale(${this.lotusScale})`;
            }
            if (this.focusMode && this.lotusCounter) {
                this.lotusCounter.textContent = '0';
            }
            
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