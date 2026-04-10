# 🎣 钓鱼潮汐速查

一个专为钓鱼爱好者设计的PWA应用，提供潮汐时间查询、钓点管理和最佳钓鱼时间推荐功能。

## ✨ 功能特点

- 📱 **PWA应用**：支持离线使用，可添加到手机桌面
- 🌊 **潮汐查询**：预存潮汐数据，离线也能查询
- 📍 **钓点管理**：添加和管理个人钓点
- ⭐ **智能推荐**：基于潮汐规律推荐最佳钓鱼时间
- 📅 **周历视图**：一周钓鱼指数一目了然
- 📖 **钓鱼指南**：潮汐与钓鱼关系的知识科普
- 🌙 **暗黑模式**：支持系统暗黑模式自动切换
- 🔧 **鸿蒙适配**：针对鸿蒙系统优化

## 🚀 快速开始

### 在线访问
直接访问 GitHub Pages 部署地址即可使用。

### 本地开发
```bash
# 克隆项目
git clone https://github.com/lethe0108/fishing-tide-pwa.git

# 进入目录
cd fishing-tide-pwa

# 使用任意静态服务器运行
# 例如使用 Python
python -m http.server 8080

# 或使用 Node.js
npx serve .
```

### 添加到桌面

#### iOS Safari
1. 打开应用网页
2. 点击底部分享按钮
3. 选择"添加到主屏幕"

#### Android Chrome
1. 打开应用网页
2. 点击菜单（三个点）
3. 选择"添加到主屏幕"

#### 鸿蒙系统
1. 打开应用网页
2. 点击菜单
3. 选择"添加到桌面"

## 📁 项目结构

```
fishing-tide-pwa/
├── index.html          # 主页面
├── manifest.json       # PWA配置
├── sw.js              # Service Worker
├── styles.css         # 样式文件
├── app.js             # 应用逻辑
├── tide-data.js       # 潮汐数据模块
├── icons/             # 应用图标
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-192.png
│   ├── icon-384.png
│   └── icon-512.png
└── README.md          # 项目说明
```

## 🛠 技术栈

- **前端**：HTML5 + CSS3 + JavaScript (ES6+)
- **PWA**：Service Worker + Web App Manifest
- **存储**：LocalStorage + Cache API
- **响应式**：Mobile First + 自适应布局

## 📋 功能详解

### 潮汐查询
- 显示当日高潮、低潮时间
- 详细的潮汐时间表
- 支持多个预设钓点

### 钓点管理
- 8个预设热门钓点
- 支持添加自定义钓点
- 钓点分类管理

### 钓鱼推荐
- 基于潮汐的智能推荐
- 黄金时段、推荐时段标识
- 钓鱼指数评分

### 周历视图
- 一周钓鱼指数预览
- 快速切换日期
- 指数等级颜色标识

## 🔒 离线支持

应用使用 Service Worker 缓存核心资源：
- HTML/CSS/JS 文件
- 应用图标
- 预存潮汐数据

首次访问后，应用可在完全离线状态下使用。

## ⚡ 性能优化

- 静态资源缓存策略
- 智能数据预加载
- 高效的DOM操作
- 响应式图片处理

## 🌐 浏览器兼容性

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- 鸿蒙浏览器

## 📝 更新日志

### v1.0.0 (2024-04-10)
- ✅ 基础PWA功能
- ✅ 潮汐查询
- ✅ 钓点管理
- ✅ 钓鱼推荐
- ✅ 周历视图
- ✅ 离线支持

## 📄 开源协议

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，欢迎通过 GitHub Issues 反馈。