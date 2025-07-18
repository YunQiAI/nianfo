// 内置的木鱼音效数据 (Base64 编码的简短音效)
// 这是一个简单的木鱼敲击声音效，用户可以替换为更好的音效文件
const WOODEN_FISH_AUDIO_DATA = {
    // 简单的木鱼音效数据 - 可以被更好的音效文件替换
    generateAudioBuffer: function(audioContext) {
        const sampleRate = audioContext.sampleRate;
        const duration = 0.4; // 0.4秒
        const length = sampleRate * duration;
        
        // 创建音频缓冲区
        const audioBuffer = audioContext.createBuffer(1, length, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        // 生成木鱼音效
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            
            // 基础频率 480Hz 的木鱼音色
            let sample = Math.sin(2 * Math.PI * 480 * t);
            
            // 添加谐波增加丰富度
            sample += 0.4 * Math.sin(2 * Math.PI * 960 * t);
            sample += 0.25 * Math.sin(2 * Math.PI * 1440 * t);
            sample += 0.15 * Math.sin(2 * Math.PI * 1920 * t);
            
            // 添加少量噪声模拟木质敲击质感
            sample += 0.08 * (Math.random() * 2 - 1) * Math.exp(-t * 15);
            
            // 木鱼特有的快速攻击和中等衰减包络
            let envelope;
            if (t < 0.005) {
                // 快速攻击阶段
                envelope = t / 0.005;
            } else {
                // 指数衰减阶段
                envelope = Math.exp(-(t - 0.005) * 6);
            }
            
            // 应用包络并限制音量
            channelData[i] = sample * envelope * 0.25;
        }
        
        return audioBuffer;
    }
};

// 导出供主应用使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WOODEN_FISH_AUDIO_DATA;
}