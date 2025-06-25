
# 🌍 HandTrack 3D Earth

实时手势交互的 3D 地球可视化项目，结合 **Three.js + MediaPipe + Vue 3** 实现，通过摄像头识别手势操作，控制地球模型的材质切换、缩放、旋转等动态行为。

![screenshot](./public/screenshot.png)

---

## 🚀 功能亮点

- ✋ 手势识别：基于 MediaPipe 实时检测 21 个手部关键点
- 🌐 地球模型：Three.js 渲染高精度球体，支持法线贴图等多重材质
- 🎮 交互控制：
  - **V 手势**：切换地球材质显示阶段（贴图 → 法线 → 光照 → 金属/粗糙度）
  - **五指张开**：进入缩放控制模式，拇指与食指距离控制缩放
  - **食指 Point**：进入旋转控制模式，左右移动控制地球自转
  - **握拳**：退出当前控制模式
- 🔁 状态提示：环形进度圈 + 文字提示确认手势识别
- 🧩 组件化结构：前端完全使用 Vue3 + Composition API 编写，组件灵活可复用

---

## 🛠 技术栈

| 技术     | 用途说明                     |
|----------|------------------------------|
| `Vue 3`  | 前端 UI 框架                 |
| `Three.js` | WebGL 渲染 3D 场景与地球模型 |
| `MediaPipe Hands` | 实时手势关键点追踪          |
| `TypeScript` | 全类型项目开发                 |
| `Element Plus` | UI 控制面板展示交互状态         |

---

## 📦 安装与运行

### 克隆项目

```bash
git clone git@github.com:your-username/handtrack-3d-earth.git
cd handtrack-3d-earth
```

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

> ⚠️ 请确保你已连接摄像头并授权使用权限

---

## 🖼 项目结构说明

```bash
src/
├── components/
│   ├── EarthScene.vue         # 地球模型主组件
│   ├── HandTracker.vue        # 摄像头图像 & 手势识别主循环
│   └── UIControlPanel.vue     # ElementPlus 控制面板
├── three/                     # Three.js 基础类封装
├── assets/                    # 地球贴图等素材
public/
├── Earth/                     # 材质贴图文件夹
└── images/101.png             # 背景图素材
```

---

## 📹 手势演示交互图

| 手势     | 效果               |
|----------|--------------------|
| ✌️ V 手势   | 材质切换             |
| ✋ 张开五指 | 进入缩放控制         |
| 👉 食指 Point | 控制旋转（左右滑动）  |
| ✊ 握拳     | 退出缩放/旋转模式     |

---

## ✨ TODO（可扩展方向）

- 添加平移控制（如中指 Point）
- 引入深度图模拟更多光照材质
- 多手互动（双手不同手势控制多个对象）
- 与 LeapMotion / Depth Camera 联动

---

## 📄 License

MIT License © 2025 [Your Name]

---

## 🙌 鸣谢

- [MediaPipe](https://mediapipe.dev/)
- [Three.js](https://threejs.org/)
- [Element Plus](https://element-plus.org/)
