class SpeechRecognitionModule {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.recognition = null;
        this.isListening = false;
        this.shouldRestart = false;
        this.lastInterimText = '';
        this.processedText = new Set();
        this.interimBuffer = '';
        this.bufferTimeout = null;
        this.lastCountTime = 0;
        this.cooldownPeriod = 1000;
        this.processedPhrases = new Set();
        this.lastProcessedText = '';
        
        this.chantPatterns = {
            amitabha: /阿弥陀佛|阿弥陀|南无阿弥陀佛|南无阿弥陀/i
        };
        
        this.initializeSpeechRecognition();
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
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.eventEmitter.emit('speechStart');
            this.processedText.clear();
            this.processedPhrases.clear();
            this.lastProcessedText = '';
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.eventEmitter.emit('speechEnd');
            
            if (this.shouldRestart) {
                this.shouldRestart = false;
                setTimeout(() => this.startListening(), 100);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('语音识别错误:', event.error);
            
            if (event.error === 'no-speech') {
                this.eventEmitter.emit('speechStatus', '未检测到语音，请继续念诵', true);
                return;
            }
            
            if (event.error === 'aborted') {
                return;
            }
            
            this.eventEmitter.emit('speechError', event.error);
            this.isListening = false;
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
                    if (transcript !== this.lastInterimText) {
                        this.lastInterimText = transcript;
                        
                        if (this.bufferTimeout) {
                            clearTimeout(this.bufferTimeout);
                        }
                        
                        this.interimBuffer = transcript;
                        
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
        
        if (text === this.lastProcessedText || this.processedPhrases.has(text)) {
            return;
        }
        
        if (this.chantPatterns.amitabha.test(text)) {
            if (currentTime - this.lastCountTime >= this.cooldownPeriod) {
                this.lastCountTime = currentTime;
                this.eventEmitter.emit('chantDetected', {
                    type: 'amitabha',
                    timestamp: timestamp,
                    text: text,
                    source: 'final'
                });
            }
        }
        
        this.processedPhrases.add(text);
        this.lastProcessedText = text;
        
        if (this.processedPhrases.size > 100) {
            const oldestItems = Array.from(this.processedPhrases).slice(0, 50);
            oldestItems.forEach(item => this.processedPhrases.delete(item));
        }
    }
    
    processInterimText(text) {
        const currentTime = Date.now();
        
        if (this.chantPatterns.amitabha.test(text) && 
            currentTime - this.lastCountTime >= this.cooldownPeriod &&
            !this.processedPhrases.has(text)) {
            
            const timestamp = new Date().toLocaleTimeString('zh-CN');
            this.lastCountTime = currentTime;
            this.processedPhrases.add(text);
            
            this.eventEmitter.emit('chantDetected', {
                type: 'amitabha',
                timestamp: timestamp,
                text: text,
                source: 'interim'
            });
        }
    }
    
    startListening() {
        if (!this.recognition) {
            this.eventEmitter.emit('speechError', '语音识别功能不可用');
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
            this.eventEmitter.emit('speechError', '启动失败，请重试');
        }
    }
    
    stopListening() {
        if (!this.isListening) {
            return;
        }
        
        this.shouldRestart = false;
        this.recognition.stop();
    }
    
    isRecognitionListening() {
        return this.isListening;
    }
}