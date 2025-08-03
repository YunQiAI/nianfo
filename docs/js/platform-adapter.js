/**
 * 跨平台适配器
 * 处理不同平台的API差异
 */

class PlatformAdapter {
    constructor() {
        this.platform = this.detectPlatform();
        this.initPlatform();
    }

    detectPlatform() {
        // 检测运行环境
        if (window.__TAURI__) {
            return 'tauri';
        } else if (window.Capacitor) {
            return 'capacitor';
        } else {
            return 'web';
        }
    }

    initPlatform() {
        console.log(`运行平台: ${this.platform}`);
        
        // 平台特定初始化
        if (this.platform === 'tauri') {
            this.initTauri();
        } else if (this.platform === 'capacitor') {
            this.initCapacitor();
        }
    }

    initTauri() {
        // Tauri 特定初始化
        console.log('Tauri 环境初始化');
        
        // 在 Tauri 环境下，语音识别仍使用 Web Speech API
        // 但存储使用 Tauri 的文件系统
    }

    async initCapacitor() {
        // Capacitor 特定初始化
        console.log('Capacitor 环境初始化');
        
        // 请求麦克风权限
        if (window.Capacitor.isNativePlatform()) {
            try {
                const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
                const { granted } = await SpeechRecognition.requestPermissions();
                console.log('麦克风权限:', granted);
            } catch (error) {
                console.error('请求麦克风权限失败:', error);
            }
        }
    }

    // 获取语音识别API
    getSpeechRecognition() {
        if (this.platform === 'capacitor' && window.Capacitor.isNativePlatform()) {
            // iOS 原生语音识别
            return this.getCapacitorSpeechRecognition();
        } else {
            // Web Speech API
            return window.SpeechRecognition || window.webkitSpeechRecognition;
        }
    }

    // Capacitor 语音识别适配器
    getCapacitorSpeechRecognition() {
        // 返回一个模拟 Web Speech API 的包装器
        class CapacitorSpeechRecognition {
            constructor() {
                this.continuous = false;
                this.interimResults = false;
                this.lang = 'zh-CN';
                this.maxAlternatives = 1;
                this.onresult = null;
                this.onerror = null;
                this.onend = null;
                this.onstart = null;
                this.isListening = false;
                this.listeners = [];
            }

            async start() {
                if (this.isListening) return;
                
                try {
                    const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
                    
                    // 清理之前的监听器
                    this.removeAllListeners();
                    
                    this.isListening = true;
                    
                    // 设置监听器
                    const partialListener = await SpeechRecognition.addListener('partialResults', (data) => {
                        if (this.onresult && data.matches && data.matches.length > 0) {
                            const event = {
                                results: [[{
                                    transcript: data.matches[0],
                                    confidence: 1.0
                                }]],
                                resultIndex: 0
                            };
                            event.results[0].isFinal = false;
                            this.onresult(event);
                        }
                    });
                    this.listeners.push(partialListener);

                    const resultsListener = await SpeechRecognition.addListener('results', (data) => {
                        if (this.onresult && data.matches && data.matches.length > 0) {
                            const event = {
                                results: [[{
                                    transcript: data.matches[0],
                                    confidence: 1.0
                                }]],
                                resultIndex: 0
                            };
                            event.results[0].isFinal = true;
                            this.onresult(event);
                            
                            // 如果是连续模式，自动重启
                            if (this.continuous && this.isListening) {
                                setTimeout(() => this.restartRecognition(), 100);
                            }
                        }
                    });
                    this.listeners.push(resultsListener);
                    
                    // 开始识别
                    await SpeechRecognition.start({
                        language: this.lang,
                        maxResults: this.maxAlternatives,
                        prompt: '请说话...',
                        partialResults: this.interimResults,
                        popup: false
                    });

                    if (this.onstart) {
                        this.onstart();
                    }

                } catch (error) {
                    this.isListening = false;
                    if (this.onerror) {
                        this.onerror({ error: 'not-allowed', message: error.message });
                    }
                }
            }

            async stop() {
                this.isListening = false;
                try {
                    const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
                    await SpeechRecognition.stop();
                    this.removeAllListeners();
                    if (this.onend) {
                        this.onend();
                    }
                } catch (error) {
                    console.error('停止语音识别失败:', error);
                }
            }

            abort() {
                this.stop();
            }
            
            async restartRecognition() {
                if (!this.isListening) return;
                
                try {
                    const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
                    await SpeechRecognition.stop();
                    
                    // 短暂延迟后重新开始
                    setTimeout(async () => {
                        if (this.isListening) {
                            await SpeechRecognition.start({
                                language: this.lang,
                                maxResults: this.maxAlternatives,
                                prompt: '请说话...',
                                partialResults: this.interimResults,
                                popup: false
                            });
                        }
                    }, 200);
                } catch (error) {
                    console.error('重启语音识别失败:', error);
                }
            }
            
            removeAllListeners() {
                this.listeners.forEach(listener => {
                    if (listener && listener.remove) {
                        listener.remove();
                    }
                });
                this.listeners = [];
            }
        }

        return CapacitorSpeechRecognition;
    }

    // 获取存储API
    getStorage() {
        if (this.platform === 'tauri') {
            // 使用 Tauri 文件系统存储
            return {
                getItem: async (key) => {
                    try {
                        const { invoke } = window.__TAURI__.core;
                        const data = await invoke('load_data', { key });
                        return data || null;
                    } catch (error) {
                        console.error('Tauri 读取数据失败:', error);
                        return null;
                    }
                },
                setItem: async (key, value) => {
                    try {
                        const { invoke } = window.__TAURI__.core;
                        await invoke('save_data', { key, value });
                    } catch (error) {
                        console.error('Tauri 保存数据失败:', error);
                    }
                },
                removeItem: async (key) => {
                    // Tauri 版本暂时通过保存空值实现删除
                    try {
                        const { invoke } = window.__TAURI__.core;
                        await invoke('save_data', { key, value: '' });
                    } catch (error) {
                        console.error('Tauri 删除数据失败:', error);
                    }
                }
            };
        } else if (this.platform === 'capacitor' && window.Capacitor.isNativePlatform()) {
            // 使用 Capacitor Storage
            return {
                getItem: async (key) => {
                    const { Preferences } = await import('@capacitor/preferences');
                    const { value } = await Preferences.get({ key });
                    return value;
                },
                setItem: async (key, value) => {
                    const { Preferences } = await import('@capacitor/preferences');
                    await Preferences.set({ key, value });
                },
                removeItem: async (key) => {
                    const { Preferences } = await import('@capacitor/preferences');
                    await Preferences.remove({ key });
                }
            };
        } else {
            // 使用 localStorage
            return {
                getItem: (key) => Promise.resolve(localStorage.getItem(key)),
                setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
                removeItem: (key) => Promise.resolve(localStorage.removeItem(key))
            };
        }
    }

    // 显示原生通知
    async showNotification(title, body) {
        if (this.platform === 'tauri') {
            // Tauri 通知
            const { sendNotification } = await import('@tauri-apps/plugin-notification');
            sendNotification({ title, body });
        } else if (this.platform === 'capacitor' && window.Capacitor.isNativePlatform()) {
            // Capacitor 通知
            const { LocalNotifications } = await import('@capacitor/local-notifications');
            await LocalNotifications.schedule({
                notifications: [{
                    title,
                    body,
                    id: Date.now(),
                    schedule: { at: new Date(Date.now() + 100) }
                }]
            });
        } else if ('Notification' in window && Notification.permission === 'granted') {
            // Web 通知
            new Notification(title, { body });
        }
    }

    // 振动反馈
    async vibrate(duration = 100) {
        if (this.platform === 'capacitor' && window.Capacitor.isNativePlatform()) {
            const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
            await Haptics.impact({ style: ImpactStyle.Light });
        } else if ('vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    }
}

// 导出全局实例
window.platformAdapter = new PlatformAdapter();