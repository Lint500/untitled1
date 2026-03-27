# 项目结构说明

```
electron-react-app/
├── index.html              # Vite 入口（必须在根目录）
├── package.json
├── vite.config.ts          # Vite 配置
├── main.cjs                # Electron 主进程
├── build-electron.js       # Electron 打包脚本
│
├── src/                    # 所有源代码
│   ├── renderer/           # 渲染进程（前端）
│   │   ├── main.tsx        # 渲染进程入口
│   │   └── index.css       # 全局样式
│   │
│   ├── main/               # Electron 主进程代码
│   │   ├── window.ts       # 窗口管理
│   │   └── ipc.ts          # IPC 处理
│   │
│   ├── components/         # React 组件
│   ├── hooks/              # 自定义 Hooks
│   ├── modules/            # 功能模块
│   ├── router/             # 路由配置
│   ├── store/              # 状态管理 (Zustand)
│   ├── assets/             # 静态资源
│   └── services/           # API 服务
│
├── public/                 # 公共静态资源（直接复制到 dist）
│   └── favicon.ico
│
└── electron/               # Electron 相关配置
```

## 关键说明

### 为什么 index.html 在根目录？
- Vite 的设计要求：以 HTML 为入口，利用浏览器原生 ES 模块
- 开发时 Vite 直接服务 HTML 文件
- 打包时 HTML 作为入口被处理

### 项目结构依然清晰
- `index.html` 只是入口，不包含业务逻辑
- 所有代码都在 `src/` 内部组织
- Electron 项目特有的分离：`renderer/` vs `main/`

### 入口文件命名
- `src/renderer/main.tsx` - 渲染进程入口（原 index.tsx）
- 避免与 `src/index.css` 等文件混淆
