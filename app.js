class BuddhistChantCounter {
    constructor() {
        this.currentMode = 'metronome'; // 'keyboard', 'metronome' 或 'buddhaLight'
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
        
        this.lastCountTime = 0;
        this.cooldownPeriod = 1000; // 防重复计数冷却时间（毫秒）
        this.keyboardCooldown = 200; // 键盘模式冷却时间（毫秒）
        this.lastKeyTime = 0;
        this.lotusFlower = null; // 莲花元素
        this.lotusScale = 1; // 莲花当前缩放比例
        this.lotusCounter = null; // 莲花计数器
        
        // 节奏记录
        this.rhythmRecord = []; // 记录敲击时间戳
        this.autoPlayInterval = null; // 自动播放定时器
        this.averageInterval = 1000; // 默认间隔（毫秒）
        
        // 节拍器相关
        this.metronomeInterval = null; // 节拍器定时器
        this.isMetronomeRunning = false; // 节拍器是否运行
        this.currentTempo = 240; // 当前BPM
        
        // 贡品相关
        this.offerings = {
            water: 0,
            flower: 0,
            lamp: 0,
            incense: 0
        };
        
        // 佛光普照相关
        this.buddhaLightInterval = null; // 佛光定时器
        this.isBuddhaLightRunning = false; // 佛光是否运行
        this.lightTempo = 30; // 放光频率（次/分）
        this.lightIntensity = 80; // 光芒强度（百分比）
        this.lotusEnabled = true; // 莲花效果开关
        this.fullscreenBuddhaLight = false; // 全屏佛光模式
        
        this.initializeElements();
        this.attachEventListeners();
        this.initializeDefaultMode();
        
        // 异步加载计数（loadCounts 内部会调用 updateDisplay）
        this.loadCounts();
    }
    
    initializeElements() {
        this.elements = {
            resetBtn2: document.getElementById('resetBtn2'),
            statusIndicator: document.getElementById('statusIndicator'),
            amitabhaCount: document.getElementById('amitabhaCount'),
            amitabhaLast: document.getElementById('amitabhaLast'),
            recognitionInfo: document.getElementById('recognitionInfo'),
            comboContainer: document.getElementById('comboContainer'),
            keyboardModeBtn: document.getElementById('keyboardModeBtn'),
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
            resetBtn3: document.getElementById('resetBtn3'),
            offeringsDisplay: document.getElementById('offeringsDisplay'),
            buddhaLightBtn: document.getElementById('buddhaLightBtn'),
            buddhaLightControls: document.getElementById('buddhaLightControls'),
            lightTempoSlider: document.getElementById('lightTempoSlider'),
            lightTempoValue: document.getElementById('lightTempoValue'),
            lightIntensitySlider: document.getElementById('lightIntensitySlider'),
            lightIntensityValue: document.getElementById('lightIntensityValue'),
            lotusToggle: document.getElementById('lotusToggle'),
            fullscreenLightToggle: document.getElementById('fullscreenLightToggle'),
            buddhaLightStartBtn: document.getElementById('buddhaLightStartBtn'),
            buddhaLightStopBtn: document.getElementById('buddhaLightStopBtn'),
            resetBtn4: document.getElementById('resetBtn4')
        };
        
        // 初始化时显示加载中状态
        if (this.elements.amitabhaCount) {
            this.elements.amitabhaCount.textContent = '加载中...';
        }
    }
    
    
    
    
    playWoodenFishSound() {
        // 音效已禁用，只保留视觉反馈
        console.log('木鱼敲击');
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
        
        // 停止所有活动
        if (this.isMetronomeRunning) {
            this.stopMetronome();
        }
        if (this.isBuddhaLightRunning) {
            this.stopBuddhaLight();
        }
        
        // 重置按钮状态
        this.elements.keyboardModeBtn.classList.remove('active');
        this.elements.metronomeBtn.classList.remove('active');
        this.elements.buddhaLightBtn.classList.remove('active');
        
        // 隐藏所有控制面板
        this.elements.keyboardControls.style.display = 'none';
        this.elements.metronomeControls.style.display = 'none';
        this.elements.buddhaLightControls.style.display = 'none';
        
        if (mode === 'keyboard') {
            this.elements.keyboardModeBtn.classList.add('active');
            this.elements.keyboardControls.style.display = 'flex';
            this.updateStatus('木鱼模式 - 按任意键敲击', false);
        } else if (mode === 'metronome') {
            this.elements.metronomeBtn.classList.add('active');
            this.elements.metronomeControls.style.display = 'flex';
            this.updateStatus('节拍器模式 - 自动念佛', false);
        } else if (mode === 'buddhaLight') {
            this.elements.buddhaLightBtn.classList.add('active');
            this.elements.buddhaLightControls.style.display = 'flex';
            this.updateStatus('佛光普照模式 - 禅修冥想', false);
        }
    }
    
    switchKeyboardMode(mode) {
        this.keyboardMode = mode;
        this.chantProgress = 0; // 重置进度
        
        if (mode === 'char') {
            this.elements.charModeBtn.classList.add('active');
            this.elements.chantModeBtn.classList.remove('active');
            this.elements.keyboardHint.textContent = '按4次敲击念一句佛号（阿-弥-陀-佛）';
            this.elements.keyboardProgress.style.display = 'block';
            this.updateProgress();
        } else {
            this.elements.charModeBtn.classList.remove('active');
            this.elements.chantModeBtn.classList.add('active');
            this.elements.keyboardHint.textContent = '按1次敲击念一句佛号';
            this.elements.keyboardProgress.style.display = 'none';
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
        
        // 播放木鱼声音
        this.playWoodenFishSound();
        
        // 记录敲击节奏
        this.recordRhythm();
        
        if (this.keyboardMode === 'char') {
            // 按字敲击模式：4次敲击念一句佛号
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
                this.elements.recognitionInfo.textContent = `完成一句佛号 +1`;
                this.elements.amitabhaLast.textContent = `最后完成: ${new Date().toLocaleTimeString('zh-CN')}`;
                
                // 检查是否需要自动进入专注模式
                this.checkAutoFocus();
            } else {
                // 更新状态
                this.elements.recognitionInfo.textContent = `进度: ${this.chantProgress}/4`;
            }
        } else {
            // 按佛号敲击模式：1次敲击念一句佛号
            this.counts.amitabha++;
            
            // 视觉反馈
            this.animateCount(this.elements.amitabhaCount);
            this.showComboEffect();
            this.showBuddhaLight();
            
            // 更新显示
            this.saveCounts();
            this.updateDisplay();
            
            // 更新状态
            this.elements.recognitionInfo.textContent = `念佛 +1`;
            this.elements.amitabhaLast.textContent = `最后完成: ${new Date().toLocaleTimeString('zh-CN')}`;
            
            // 检查是否需要自动进入专注模式
            this.checkAutoFocus();
        }
    }
    
    flashBuddhaImage() {
        // 移除佛像闪烁效果，保持庄严静止
    }
    
    recordRhythm() {
        const now = Date.now();
        
        // 记录时间戳
        this.rhythmRecord.push(now);
        
        // 只保留最近20次敲击
        if (this.rhythmRecord.length > 20) {
            this.rhythmRecord.shift();
        }
        
        // 计算平均间隔
        if (this.rhythmRecord.length >= 2) {
            let totalInterval = 0;
            for (let i = 1; i < this.rhythmRecord.length; i++) {
                totalInterval += this.rhythmRecord[i] - this.rhythmRecord[i-1];
            }
            this.averageInterval = totalInterval / (this.rhythmRecord.length - 1);
        }
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
        const lightElement = document.createElement('div');
        
        // 检查是否是佛光普照模式且启用了全屏效果
        if (this.currentMode === 'buddhaLight' && this.fullscreenBuddhaLight) {
            lightElement.className = 'buddha-light fullscreen';
            document.body.appendChild(lightElement);
        } else {
            lightElement.className = 'buddha-light';
            const buddhaContainer = document.querySelector('.buddha-image-container');
            buddhaContainer.appendChild(lightElement);
        }
        
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
            
            // 如果是佛光普照模式，添加特殊标识
            if (this.currentMode === 'buddhaLight') {
                document.body.classList.add('buddha-light-focus');
            } else {
                // 进入专注模式时创建莲花
                if (!this.lotusFlower || !this.lotusFlower.parentNode) {
                    this.createLotusFlower();
                }
                
                // 开始自动敲击
                this.startAutoPlay();
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
            document.body.classList.remove('buddha-light-focus');
            
            // 只在非佛光普照模式下停止自动敲击和清理莲花
            if (this.currentMode !== 'buddhaLight') {
                // 停止自动敲击
                this.stopAutoPlay();
                
                // 停止节拍器（如果正在运行）
                if (this.isMetronomeRunning) {
                    this.stopMetronome();
                }
                
                // 退出专注模式时移除莲花
                if (this.lotusFlower && this.lotusFlower.parentNode) {
                    this.lotusFlower.parentNode.removeChild(this.lotusFlower);
                    this.lotusFlower = null;
                }
            }
            
            // 清理莲花计数器（所有模式都清理）
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
    
    startAutoPlay() {
        // 如果没有记录的节奏，使用默认间隔
        const interval = this.averageInterval || 1000;
        
        // 清除已有的定时器
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
        
        // 开始自动敲击
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
        // 播放声音
        this.playWoodenFishSound();
        
        // 模拟按键效果
        this.chantProgress++;
        this.updateProgress();
        
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
            this.elements.recognitionInfo.textContent = `自动念佛 +1`;
            this.elements.amitabhaLast.textContent = `最后完成: ${new Date().toLocaleTimeString('zh-CN')}`;
            
            // 检查是否需要自动进入专注模式（已经在专注模式，所以不需要）
        } else {
            // 更新状态
            this.elements.recognitionInfo.textContent = `进度: ${this.chantProgress}/4`;
        }
    }
    
    handleEscapeKey(e) {
        if (e.key === 'Escape' && this.focusMode) {
            this.toggleFocusMode();
        }
    }
    
    // 节拍器功能
    startMetronome() {
        if (this.isMetronomeRunning) return;
        
        this.isMetronomeRunning = true;
        this.elements.metronomeStartBtn.disabled = true;
        this.elements.metronomeStopBtn.disabled = false;
        
        // 计算节拍间隔（毫秒）
        const interval = (60 / this.currentTempo) * 1000;
        
        this.metronomeInterval = setInterval(() => {
            this.metronomeHit();
        }, interval);
        
        this.updateStatus(`节拍器运行中 - ${this.currentTempo} BPM`, true);
        console.log(`节拍器启动，BPM: ${this.currentTempo}，间隔: ${interval}ms`);
    }
    
    stopMetronome() {
        if (!this.isMetronomeRunning) return;
        
        this.isMetronomeRunning = false;
        this.elements.metronomeStartBtn.disabled = false;
        this.elements.metronomeStopBtn.disabled = true;
        
        if (this.metronomeInterval) {
            clearInterval(this.metronomeInterval);
            this.metronomeInterval = null;
        }
        
        this.updateStatus('节拍器已停止', false);
        console.log('节拍器停止');
    }
    
    metronomeHit() {
        // 播放音效
        this.playWoodenFishSound();
        
        // 增加计数（每4拍计为一次念佛）
        this.chantProgress++;
        
        if (this.chantProgress >= 4) {
            this.counts.amitabha++;
            this.chantProgress = 0;
            
            // 视觉反馈
            this.animateCount(this.elements.amitabhaCount);
            this.showComboEffect();
            this.showBuddhaLight();
            
            // 更新显示
            this.saveCounts();
            this.updateDisplay();
            
            // 更新状态
            this.elements.recognitionInfo.textContent = `节拍器念佛 +1`;
            this.elements.amitabhaLast.textContent = `最后完成: ${new Date().toLocaleTimeString('zh-CN')}`;
            
            // 检查是否需要自动进入专注模式
            this.checkAutoFocus();
        }
    }
    
    updateTempo(tempo) {
        this.currentTempo = tempo;
        this.elements.tempoValue.textContent = tempo;
        
        // 如果节拍器正在运行，重新启动以应用新速度
        if (this.isMetronomeRunning) {
            this.stopMetronome();
            // 短暂延迟后重新启动，避免音效重叠
            setTimeout(() => {
                this.startMetronome();
            }, 100);
        }
    }
    
    attachEventListeners() {
        this.elements.resetBtn2.addEventListener('click', () => this.resetCounts());
        this.elements.resetBtn3.addEventListener('click', () => this.resetCounts());
        this.elements.resetBtn4.addEventListener('click', () => this.resetCounts());
        
        // 模式切换
        this.elements.keyboardModeBtn.addEventListener('click', () => this.switchMode('keyboard'));
        this.elements.metronomeBtn.addEventListener('click', () => this.switchMode('metronome'));
        this.elements.buddhaLightBtn.addEventListener('click', () => this.switchMode('buddhaLight'));
        
        // 木鱼模式子选项
        this.elements.charModeBtn.addEventListener('click', () => this.switchKeyboardMode('char'));
        this.elements.chantModeBtn.addEventListener('click', () => this.switchKeyboardMode('chant'));
        
        // 节拍器控制
        this.elements.metronomeStartBtn.addEventListener('click', () => this.startMetronome());
        this.elements.metronomeStopBtn.addEventListener('click', () => this.stopMetronome());
        this.elements.tempoSlider.addEventListener('input', (e) => this.updateTempo(parseInt(e.target.value)));
        
        // 佛光普照控制
        this.elements.buddhaLightStartBtn.addEventListener('click', () => this.startBuddhaLight());
        this.elements.buddhaLightStopBtn.addEventListener('click', () => this.stopBuddhaLight());
        this.elements.lightTempoSlider.addEventListener('input', (e) => this.updateLightTempo(parseInt(e.target.value)));
        this.elements.lightIntensitySlider.addEventListener('input', (e) => this.updateLightIntensity(parseInt(e.target.value)));
        this.elements.lotusToggle.addEventListener('change', (e) => this.toggleLotusEffect(e.target.checked));
        this.elements.fullscreenLightToggle.addEventListener('change', (e) => this.toggleFullscreenLight(e.target.checked));
        
        // 专注模式
        this.elements.focusBtn.addEventListener('click', () => this.toggleFocusMode());
        
        // 键盘监听
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    
    
    resetCounts() {
        if (confirm('确定要重置所有计数吗？')) {
            // 停止所有活动
            if (this.isMetronomeRunning) {
                this.stopMetronome();
            }
            
            this.counts = {
                amitabha: 0
            };
            
            // 重置进度
            this.chantProgress = 0;
            this.updateProgress();
            
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
    
    async saveCounts() {
        const storage = window.platformAdapter ? 
            window.platformAdapter.getStorage() : 
            { setItem: (k, v) => Promise.resolve(localStorage.setItem(k, v)) };
        
        await storage.setItem('buddhistChantCounts', JSON.stringify(this.counts));
    }
    
    async loadCounts() {
        const storage = window.platformAdapter ? 
            window.platformAdapter.getStorage() : 
            { getItem: (k) => Promise.resolve(localStorage.getItem(k)) };
        
        const saved = await storage.getItem('buddhistChantCounts');
        if (saved) {
            try {
                this.counts = JSON.parse(saved);
            } catch (error) {
                console.error('加载保存的计数失败:', error);
            }
        }
        
        // 加载完成后立即更新显示
        this.updateDisplay();
    }
    
    // 佛光普照相关方法
    startBuddhaLight() {
        if (this.isBuddhaLightRunning) {
            return;
        }
        
        this.isBuddhaLightRunning = true;
        this.elements.buddhaLightStartBtn.disabled = true;
        this.elements.buddhaLightStopBtn.disabled = false;
        
        // 计算间隔时间
        const interval = (60 / this.lightTempo) * 1000; // 转换为毫秒
        
        // 启动定时器来触发佛光和莲花效果
        this.buddhaLightInterval = setInterval(() => {
            // 触发佛光效果（复用现有方法）
            this.showBuddhaLight();
            
            // 触发莲花效果（如果启用，但不显示计数）
            if (this.lotusEnabled) {
                this.createBuddhaLightLotus();
            }
            
            // 播放音效但不计数
            this.playWoodenFishSound();
        }, interval);
        
        this.updateStatus(`佛光普照中 - ${this.lightTempo} 次/分`, true);
        console.log(`佛光普照启动，频率: ${this.lightTempo} 次/分，间隔: ${interval}ms`);
    }
    
    stopBuddhaLight() {
        if (!this.isBuddhaLightRunning) {
            return;
        }
        
        this.isBuddhaLightRunning = false;
        this.elements.buddhaLightStartBtn.disabled = false;
        this.elements.buddhaLightStopBtn.disabled = true;
        
        // 清除定时器
        if (this.buddhaLightInterval) {
            clearInterval(this.buddhaLightInterval);
            this.buddhaLightInterval = null;
        }
        
        this.updateStatus('佛光普照模式 - 禅修冥想', false);
        console.log('佛光普照停止');
    }
    
    updateLightTempo(tempo) {
        this.lightTempo = tempo;
        this.elements.lightTempoValue.textContent = tempo;
        
        // 如果正在运行，重启以应用新频率
        if (this.isBuddhaLightRunning) {
            this.stopBuddhaLight();
            setTimeout(() => this.startBuddhaLight(), 100);
        }
    }
    
    updateLightIntensity(intensity) {
        this.lightIntensity = intensity;
        this.elements.lightIntensityValue.textContent = intensity;
        // 光芒强度可以通过调整现有佛光效果的透明度来实现
    }
    
    toggleLotusEffect(enabled) {
        this.lotusEnabled = enabled;
        // 简单的开关，在定时器中检查此状态
    }
    
    toggleFullscreenLight(enabled) {
        this.fullscreenBuddhaLight = enabled;
        console.log('全屏佛光效果', enabled ? '已启用' : '已禁用');
    }
    
    // 佛光普照专用莲花效果（不显示计数）
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
        lotusFlower.style.left = '0px'; // 居中位置
        lotusFlower.style.transform = 'translate(-50%, -180px) scale(1)';
        
        this.elements.comboContainer.appendChild(lotusFlower);
        
        // 设置自动清理，不创建计数器
        setTimeout(() => {
            if (lotusFlower.parentNode) {
                lotusFlower.parentNode.removeChild(lotusFlower);
            }
        }, 3000);
    }
    
    // 贡品相关方法
    addOffering(type) {
        this.offerings[type]++;
        this.updateOfferingsDisplay();
        this.saveOfferings();
        this.showOfferingAnimation(type);
    }
    
    removeOffering(type) {
        if (this.offerings[type] > 0) {
            this.offerings[type]--;
            this.updateOfferingsDisplay();
            this.saveOfferings();
            this.showRemoveOfferingAnimation(type);
        }
    }
    
    updateOfferingsDisplay() {
        const display = this.elements.offeringsDisplay;
        display.innerHTML = '';
        
        // 按类型顺序排列贡品
        const order = ['water', 'flower', 'lamp', 'incense'];
        order.forEach(type => {
            const count = this.offerings[type];
            for (let i = 0; i < count; i++) {
                const offering = document.createElement('div');
                offering.className = `offering-item-display ${type}`;
                offering.innerHTML = this.getOfferingIcon(type);
                offering.style.cursor = 'pointer';
                offering.setAttribute('data-offering-type', type);
                offering.onclick = () => this.removeOffering(type);
                display.appendChild(offering);
            }
        });
    }
    
    getOfferingIcon(type) {
        const icons = {
            water: '💧',
            flower: '🌸',
            lamp: '🕯️',
            incense: '🕉️'
        };
        return icons[type] || '';
    }
    
    showOfferingAnimation(type) {
        // 创建飞到佛台的动画效果
        const sourceItem = document.querySelector(`[data-type="${type}"]`);
        const targetAltar = this.elements.offeringsDisplay;
        
        if (sourceItem && targetAltar) {
            const flyingOffering = document.createElement('div');
            flyingOffering.className = 'flying-offering';
            flyingOffering.innerHTML = this.getOfferingIcon(type);
            
            const sourceRect = sourceItem.getBoundingClientRect();
            const targetRect = targetAltar.getBoundingClientRect();
            
            flyingOffering.style.position = 'fixed';
            flyingOffering.style.left = sourceRect.left + 'px';
            flyingOffering.style.top = sourceRect.top + 'px';
            flyingOffering.style.fontSize = '2rem';
            flyingOffering.style.zIndex = '1000';
            flyingOffering.style.pointerEvents = 'none';
            
            document.body.appendChild(flyingOffering);
            
            // 动画到目标位置
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
    
    showRemoveOfferingAnimation(type) {
        // 创建消失动画效果
        const altar = this.elements.offeringsDisplay;
        
        if (altar) {
            const disappearingOffering = document.createElement('div');
            disappearingOffering.className = 'disappearing-offering';
            disappearingOffering.innerHTML = this.getOfferingIcon(type);
            
            const altarRect = altar.getBoundingClientRect();
            
            disappearingOffering.style.position = 'fixed';
            disappearingOffering.style.left = altarRect.left + altarRect.width/2 + 'px';
            disappearingOffering.style.top = altarRect.top + altarRect.height/2 + 'px';
            disappearingOffering.style.fontSize = '2rem';
            disappearingOffering.style.zIndex = '1000';
            disappearingOffering.style.pointerEvents = 'none';
            disappearingOffering.style.transform = 'translate(-50%, -50%)';
            
            document.body.appendChild(disappearingOffering);
            
            // 消失动画
            setTimeout(() => {
                disappearingOffering.style.transition = 'all 0.8s ease-out';
                disappearingOffering.style.transform = 'translate(-50%, -50%) scale(0.1)';
                disappearingOffering.style.opacity = '0';
                
                setTimeout(() => {
                    if (disappearingOffering.parentNode) {
                        document.body.removeChild(disappearingOffering);
                    }
                }, 800);
            }, 100);
        }
    }
    
    async saveOfferings() {
        const storage = window.platformAdapter ? 
            window.platformAdapter.getStorage() : 
            { setItem: (k, v) => Promise.resolve(localStorage.setItem(k, v)) };
        
        await storage.setItem('buddhist_offerings', JSON.stringify(this.offerings));
    }
    
    async loadOfferings() {
        const storage = window.platformAdapter ? 
            window.platformAdapter.getStorage() : 
            { getItem: (k) => Promise.resolve(localStorage.getItem(k)) };
        
        const saved = await storage.getItem('buddhist_offerings');
        if (saved) {
            try {
                this.offerings = { ...this.offerings, ...JSON.parse(saved) };
            } catch (error) {
                console.error('加载保存的贡品失败:', error);
            }
        }
        this.updateOfferingsDisplay();
    }
}

// 全局变量供HTML调用
let buddhistCounter;

document.addEventListener('DOMContentLoaded', async () => {
    // 等待平台适配器初始化
    if (window.platformAdapter) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    buddhistCounter = new BuddhistChantCounter();
    await buddhistCounter.loadOfferings();
});