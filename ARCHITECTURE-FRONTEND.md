# 前端架构文档

## 项目概述

基于 **Electron + React + Vite** 的认知系统前端应用，采用模块化、分层架构设计。

---

## 技术栈

- **框架**: React 18
- **构建工具**: Vite 5
- **桌面容器**: Electron 41
- **状态管理**: Zustand
- **路由**: React Router 7
- **HTTP 客户端**: Axios
- **样式方案**: CSS Modules
- **语言**: TypeScript 4.9

---

## 目录结构

```
├── electron/                        # Electron 主进程
│   ├── ipc/                         # IPC 通信（主进程与渲染进程通信）
│   │   ├── ipcMain.ts               # IPC 主进程处理器
│   │   └── ipcRenderer.ts           # IPC 渲染进程调用
│   ├── services/                    # 主进程服务
│   │   ├── authService.ts           # 认证服务
│   │   ├── logService.ts            # 日志服务
│   │   └── windowService.ts         # 窗口管理服务
│   ├── app.ts                       # Electron 应用入口
│   ├── main.ts                      # 主进程启动入口
│   ├── preload.ts                   # 预加载脚本（暴露 API 给渲染进程）
│   └── tsconfig.json                # TypeScript 配置
│
├── public/                          # 公共静态资源（直接复制到构建目录）
│   └── favicon.ico                  # 网站图标
│
├── src/                             # 源代码目录
│   ├── assets/                      # 静态资源层
│   │   ├── images/                  # 图片资源
│   │   ├── styles/                  # 全局样式
│   │   │   └── global.css           # CSS 变量、重置样式
│   │   └── index.ts                 # 资源统一导出
│   │
│   ├── components/                  # 通用组件层（无业务逻辑，纯 UI）
│   │   ├── Avatar/                  # 头像组件
│   │   ├── Modal/                   # 模态框组件
│   │   └── DevPanel/                # 开发者面板组件
│   │
│   ├── hooks/                       # 自定义 Hooks 层（业务逻辑封装）
│   │   ├── useAuth.ts               # 认证逻辑
│   │   ├── useAI.ts                 # AI 功能逻辑
│   │   ├── useIpc.ts                # IPC 通信逻辑
│   │   └── useCognitive.ts          # 认知系统核心逻辑（状态管理 + API 组合）
│   │
│   ├── middleware/                  # 中间件层
│   │   └── api.js                   # API 请求拦截器
│   │
│   ├── modules/                     # 业务模块层（按功能划分）
│   │   ├── mainWindow/              # 主窗口模块（认知系统界面）
│   │   ├── devPanel/                # 开发者面板模块（日志、监控）
│   │   ├── adminSystem/             # 管理系统模块（用户、参数、插件）
│   │   └── featurePopup/            # 功能弹窗模块
│   │
│   ├── renderer/                    # 渲染进程入口
│   │   ├── App.tsx                  # React 根组件
│   │   ├── main.tsx                 # React DOM 渲染入口
│   │   ├── index.html               # HTML 模板
│   │   └── reportWebVitals.ts       # 性能监控
│   │
│   ├── router/                      # 路由配置层
│   │   └── index.tsx                # React Router 定义
│   │
│   ├── services/                    # 服务层（纯 API 调用封装）
│   │   ├── request.ts               # HTTP 请求基类（Axios 封装）
│   │   ├── api.ts                   # API URL 常量
│   │   ├── cognitiveApi.ts          # 认知系统 API
│   │   ├── aiService.ts             # AI 服务
│   │   ├── systemService.ts         # 系统服务
│   │   └── pluginService.ts         # 插件服务
│   │
│   ├── store/                       # 状态管理层（Zustand）
│   │   ├── modules/                 # 分模块 Store
│   │   └── index.ts                 # Store 统一导出
│   │
│   ├── types/                       # TypeScript 类型定义
│   │   └── electron.d.ts            # Electron 类型声明
│   │
│   ├── index.tsx                    # 应用主入口（旧 CRA 遗留）
│   ├── App.tsx                      # 旧根组件（已废弃）
│   └── index.css                    # 全局样式导入
│
├── .env.example                     # 环境变量示例
├── .gitignore                       # Git 忽略文件
├── build-electron.js                # Electron 构建脚本
├── config-overrides.js              # Webpack 配置覆盖（CRA 遗留）
├── index.html                       # 根 HTML（已废弃，使用 renderer/index.html）
├── main.cjs                         # Electron 主入口（CommonJS）
├── package.json                     # 项目依赖与脚本
├── tsconfig.json                    # TypeScript 配置
├── vite.config.ts                   # Vite 开发配置
├── vite.config.electron.js          # Vite Electron 构建配置
└── vite.config.preload.js           # Vite 预加载脚本配置
```

---

## 构建与部署

### 开发环境

```bash
npm run electron:dev
# 启动 Vite 开发服务器 (5173 端口)
# 自动打开 Electron 窗口
```

### 生产构建

```bash
npm run build
# 1. Vite 构建 React 应用
# 2. electron-builder 打包
# 3. 输出到 dist/ 目录
```

---

## 关键设计决策

### 为什么使用 Hooks 而不是直接调用 Services？

1. **逻辑复用**：多个组件可共享同一业务逻辑
2. **状态集中**：避免状态分散在各处
3. **易于测试**：Hooks 可独立测试
4. **职责分离**：Components 只负责 UI

### 为什么使用 CSS Modules？

1. **作用域隔离**：避免全局污染
2. **维护性好**：样式随组件移动
3. **性能优**：构建时优化
4. **TypeScript 支持**：类型安全

### 为什么数据不硬编码？

1. **真实环境**：对接后端 API
2. **可扩展**：随时替换数据源
3. **可调试**：查看真实数据流
4. **生产可用**：无需二次修改

---

## 更新日志

### v0.1.0 (2026-03-27)

- ✅ 完成认知系统基础架构
- ✅ 实现深色控制台主题
- ✅ 所有数据 API 化
- ✅ 创建 `useCognitive` Hook 统一调用
- ✅ 移除所有硬编码数据
- ✅ 添加空状态处理
- ✅ 限制列表数据展示数量

---

## 待办事项

- [ ] 添加 WebSocket 实时通信
- [ ] 实现离线缓存
- [ ] 添加单元测试
- [ ] 性能监控集成
- [ ] 错误上报系统

---

## 联系与维护

本文档由开发团队维护，每次架构更新需同步修改此文档。

**最后更新**: 2026-03-27
