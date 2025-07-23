# 念佛计数器 macOS 应用构建指南

## 前置要求

### 1. 安装 Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### 2. 安装 Tauri 依赖
```bash
# 如果已经安装了 Xcode Command Line Tools，跳过此步
xcode-select --install
```

## 构建步骤

### 1. 开发模式运行
```bash
npm run tauri:dev
```

### 2. 构建发布版本
```bash
npm run tauri:build
```

构建完成后，应用程序将位于：
- `src-tauri/target/release/bundle/macos/念佛计数器.app`
- DMG 安装包：`src-tauri/target/release/bundle/dmg/念佛计数器_1.0.0_x64.dmg`

## 应用特性

### macOS 原生功能
- 原生窗口和菜单栏
- 本地文件存储
- 系统通知支持
- 更好的性能和启动速度

### 与 Web 版本的区别
- 不需要浏览器运行
- 支持离线使用
- 更好的系统集成
- 支持 Dock 图标和应用切换

## 故障排除

### 如果构建失败
1. 确保安装了最新版本的 Rust：`rustup update`
2. 清理构建缓存：`cd src-tauri && cargo clean`
3. 检查 Node.js 版本：需要 16.x 或更高版本

### 如果应用无法打开
- 在系统偏好设置 > 安全性与隐私中允许应用运行
- 或右键点击应用，选择"打开"

## 签名和分发

如需分发应用，建议：
1. 使用 Apple Developer ID 签名
2. 进行公证（Notarization）
3. 创建 DMG 安装包

详细信息请参考 [Tauri 官方文档](https://tauri.app/v1/guides/distribution/macos)