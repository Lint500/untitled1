# 项目架构与模块详解

## 一、项目整体架构

```
Electron + React 应用
├── Electron (桌面应用框架)
│   ├── 主进程 (main.cjs) - Node.js 环境
│   └── 渲染进程 (src/renderer) - 浏览器环境
└── React (前端框架)
    └── Vite (构建工具)
```

---

## 二、核心运行流程

### 启动流程
```
npm run electron:dev
    ↓
concurrently 并行启动两个进程
    ↓
┌─────────────────┬──────────────────┐
│  Vite 服务器     │  Electron        │
│  localhost:5173 │  main.cjs        │
│                 │                  │
│  提供 React 页面  │  创建窗口         │
│                 │  加载 URL         │
└─────────────────┴──────────────────┘
    ↓
Electron 窗口显示 React 应用
```

---

## 三、文件夹详解

### 1. `/electron` - Electron 主进程目录

**作用**：存放 Electron 主进程和预加载脚本代码

**文件说明**：
- **`main.cjs`** - 主入口文件（CommonJS 格式）
  - 创建 BrowserWindow 窗口
  - 管理应用生命周期
  - 处理 IPC 通信
  - 决定加载开发模式或生产模式

- **`app.ts`** - Electron 应用配置
  - 应用级别的设置
  - 全局事件监听

- **`preload.ts`** - 预加载脚本
  - 在渲染进程和主进程之间建立安全桥梁
  - 通过 `contextBridge` 暴露 API
  - 当前配置：暴露空的 `electronAPI` 对象

- **`ipcMain.ts`** - IPC 主进程通信
  - 处理来自渲染进程的 IPC 调用
  - 实现原生功能（文件系统、系统 API 等）

- **`ipcRenderer.ts`** - IPC 渲染进程通信
  - 向主进程发送消息
  - 调用原生功能

- **`services/`** - Electron 服务层
  - `authService.ts` - 认证服务
  - `logService.ts` - 日志服务
  - `windowService.ts` - 窗口管理服务

**应该放什么代码**：
- ✅ Electron 主进程逻辑
- ✅ 原生 Node.js API 调用
- ✅ 系统级别操作（文件、网络、硬件）
- ✅ IPC 通信处理
- ❌ React 组件
- ❌ 浏览器专用 API（DOM 操作等）

---

### 2. `/src/renderer` - 渲染进程入口

**作用**：React 应用的启动入口，Electron 窗口加载的内容

**文件说明**：
- **`index.html`** - HTML 入口模板
  - Vite 以此为基准注入脚本
  - 包含 `<div id="root"></div>` 根节点

- **`index.tsx`** - React 启动入口
  ```typescript
  ReactDOM.createRoot(document.getElementById('root'))
    .render(<App />)
  ```

- **`App.tsx`** - React 根组件
  ```typescript
  <RouterProvider router={router} />
  ```
  - 包裹路由系统
  - 所有页面组件的顶层容器

- **`index.css`** - 全局样式
  - 重置样式
  - 全局 CSS 变量

- **`reportWebVitals.ts`** - 性能监控
  - 测量应用性能指标

**运转流程**：
```
Electron 加载 http://localhost:5173
    ↓
Vite 返回 index.html
    ↓
浏览器解析并执行 index.tsx
    ↓
渲染 App.tsx
    ↓
RouterProvider 根据路由渲染对应页面
```

**应该放什么代码**：
- ✅ React 启动逻辑
- ✅ 根组件
- ✅ 全局样式
- ❌ 业务组件（放在 `/modules`）

---

### 3. `/src/modules` - 业务模块目录

**作用**：按功能划分的业务模块，每个模块独立完整

**模块结构**：
```
modules/
├── mainWindow/      # 主窗口模块
├── adminSystem/     # 管理系统模块
├── devPanel/        # 开发者面板模块
└── featurePopup/    # 功能弹窗模块
```

#### 3.1 `mainWindow` - 主窗口模块

**文件**：
- `MainView.tsx` - 主页面组件
- `MainView.module.css` - 模块化样式
- `index.tsx` - 模块导出

**功能**：
- 显示欢迎界面
- 展示用户角色信息
- Avatar 头像入口

**代码示例**：
```typescript
// MainView.tsx
function MainView() {
  const { isDeveloper, userRole } = useAuth()
  
  return (
    <div>
      <h1>欢迎使用</h1>
      <Avatar />
      <p>角色：{userRole}</p>
    </div>
  )
}
```

**应该放什么代码**：
- ✅ 主界面的 UI 组件
- ✅ 用户状态展示
- ✅ 功能入口导航

---

#### 3.2 `adminSystem` - 管理系统模块

**文件**：
- `index.tsx` - 管理系统主组件
- `ParamEditor.tsx` - 参数编辑器
- `PluginManager.tsx` - 插件管理器
- `UserManage.tsx` - 用户管理器
- `*.module.css` - 各组件样式

**功能**：
- Tab 切换式管理界面
- 三个子功能模块

**运转方式**：
```typescript
function AdminSystem() {
  const [activeTab, setActiveTab] = useState('params')
  
  return (
    <div>
      <TabList onChange={setActiveTab}>
        <Tab id="params">参数编辑</Tab>
        <Tab id="plugins">插件管理</Tab>
        <Tab id="users">用户管理</Tab>
      </TabList>
      
      {activeTab === 'params' && <ParamEditor />}
      {activeTab === 'plugins' && <PluginManager />}
      {activeTab === 'users' && <UserManage />}
    </div>
  )
}
```

**应该放什么代码**：
- ✅ 管理类功能
- ✅ 配置编辑功能
- ✅ 数据管理功能

---

#### 3.3 `devPanel` - 开发者面板模块

**文件**：
- `index.tsx` - 开发者面板入口
- `LogView.tsx` - 日志查看器
- `LogicView.tsx` - 运行逻辑视图
- `Monitor.tsx` - 性能监控
- `*.module.css` - 样式文件

**功能**：
- 实时日志显示
- 应用运行逻辑可视化
- 性能指标监控

**数据来源**：从 `devStore` 获取日志数据

**应该放什么代码**：
- ✅ 调试工具
- ✅ 监控面板
- ✅ 开发辅助功能

---

#### 3.4 `featurePopup` - 功能弹窗模块

**文件**：
- `index.tsx` - 弹窗主组件
- `FeatureMenu.tsx` - 功能菜单
- `*.module.css` - 样式

**功能**：
- 点击 Avatar 后弹出的菜单
- 快速访问各种功能

**应该放什么代码**：
- ✅ 弹出式 UI
- ✅ 快捷菜单
- ✅ 临时交互界面

---

### 4. `/src/components` - 公共组件库

**作用**：存放可复用的 UI 组件，跨模块使用

**组件列表**：
- **`Avatar/`** - 头像组件
  - 显示用户头像
  - 点击打开功能菜单
  - 支持不同尺寸

- **`Modal/`** - 模态框组件
  - 通用对话框
  - 支持自定义内容
  - 控制显示/隐藏

- **`DevPanel/`** - 开发者面板容器
  - 包裹开发工具的容器组件
  - 控制面板开关

**应该放什么代码**：
- ✅ 纯 UI 组件（无业务逻辑）
- ✅ 可在多处复用的组件
- ✅ 基础交互组件
- ❌ 特定业务逻辑（放在 `/modules`）

**与 modules 的区别**：
```
components/Avatar   → 只是显示头像（可复用）
modules/mainWindow  → 包含具体业务逻辑（不可复用）
```

---

### 5. `/src/hooks` - 自定义 Hooks

**作用**：封装可复用的 React 逻辑

#### 5.1 `useAuth.ts` - 权限验证 Hook

**功能**：
- 检查用户身份
- 判断是否为开发者
- 权限验证
- 功能访问控制

**使用示例**：
```typescript
function MyComponent() {
  const { isDeveloper, hasPermission, canAccess } = useAuth()
  
  if (!canAccess('dev_panel')) return null
  
  return <div>{isDeveloper ? '开发者模式' : '普通模式'}</div>
}
```

**返回值**：
```typescript
{
  userRole: string,           // 用户角色
  isDeveloper: boolean,       // 是否开发者
  isLoading: boolean,         // 加载状态
  hasPermission: (p) => bool, // 检查权限
  canAccess: (f) => bool,     // 能否访问功能
  refreshAuth: () => void     // 刷新认证
}
```

---

#### 5.2 `useAI.ts` - AI 功能 Hook

**功能**：
- 发送对话消息
- 流式对话
- 语音通话控制
- 统一错误处理
- 加载状态管理

**使用示例**：
```typescript
function ChatWindow() {
  const { sendMessage, startVoiceCall, isLoading, error } = useAI()
  
  const handleSend = async () => {
    try {
      await sendMessage('你好')
    } catch (err) {
      console.error(err)
    }
  }
  
  return <button onClick={handleSend}>发送</button>
}
```

**返回值**：
```typescript
{
  isLoading: boolean,
  error: string | null,
  sendMessage: (msg) => Promise,
  startVoiceCall: (id?) => Promise,
  endVoiceCall: (id) => Promise,
  streamChat: (msg, onChunk) => Promise
}
```

---

#### 5.3 `useIpc.ts` - IPC 通信 Hook

**功能**：
- 封装 Electron IPC 调用
- 统一的通信接口
- 类型安全的消息传递

**应该放什么代码**：
- ✅ 跨组件的通用逻辑
- ✅ 需要状态管理的业务逻辑
- ✅ 副作用处理（API 调用、订阅等）
- ❌ UI 渲染逻辑（放在 components）

---

### 6. `/src/services` - 服务层

**作用**：封装业务逻辑和 API 调用，与 UI 完全分离

#### 6.1 `aiService.ts` - AI 服务

**功能**：
- 对话 API 调用
- 流式对话处理
- 语音通话 API
- 对话历史管理

**代码结构**：
```typescript
export const aiService = {
  chat: async (message) => {
    return request.post('/api/chat', { message })
  },
  
  streamChat: async (message, onChunk) => {
    // 流式处理逻辑
  },
  
  voiceCall: {
    start: async (targetId) => {...},
    end: async (callId) => {...}
  }
}
```

---

#### 6.2 `api.ts` - API 配置

**功能**：
- 定义 API 地址常量
- 配置基础 URL

**示例**：
```typescript
export const API_URLS = {
  AI_CHAT: '/ai/chat',
  AI_STREAM: '/ai/stream',
  AI_VOICE: '/ai/voice'
}
```

---

#### 6.3 `request.ts` - 请求封装

**功能**：
- 基于 axios 封装
- 统一请求配置
- 错误处理

---

#### 6.4 `pluginService.ts` - 插件服务

**功能**：
- 插件加载
- 插件管理
- 插件通信

---

#### 6.5 `systemService.ts` - 系统服务

**功能**：
- 系统信息获取
- 系统设置
- 原生功能调用

**应该放什么代码**：
- ✅ 业务逻辑
- ✅ API 调用
- ✅ 数据处理
- ✅ 第三方 SDK 集成
- ❌ React 组件
- ❌ DOM 操作

---

### 7. `/src/store` - 状态管理

**作用**：使用 Zustand 进行全局状态管理

#### 7.1 `index.ts` - Store 统一导出

```typescript
export { appStore } from './modules/appStore'
export { devStore } from './modules/devStore'
```

---

#### 7.2 `appStore.ts` - 应用状态

**State 结构**：
```typescript
{
  isPopupVisible: boolean,    // 弹窗显示
  theme: 'light' | 'dark',    // 主题
  userRole: 'user' | 'developer'  // 用户角色
}
```

**Actions**：
```typescript
{
  setIsPopupVisible: (bool) => void,
  setTheme: (theme) => void,
  setUserRole: (role) => void
}
```

**使用示例**：
```typescript
// 在组件中
const { theme, setTheme } = appStore()

<button onClick={() => setTheme('dark')}>
  切换到深色模式
</button>
```

---

#### 7.3 `devStore.ts` - 开发者状态

**State 结构**：
```typescript
{
  isPanelOpen: boolean,       // 面板开关
  logs: LogEntry[]            // 日志数组
}
```

**使用示例**：
```typescript
const { isPanelOpen, logs } = devStore()

{isPanelOpen && <DevPanel logs={logs} />}
```

**应该放什么代码**：
- ✅ 全局共享状态
- ✅ 跨组件的状态同步
- ✅ 简单的状态更新逻辑
- ❌ 复杂的业务逻辑（放在 services）

---

### 8. `/src/router` - 路由配置

**作用**：配置 React Router，管理页面导航

#### `index.jsx` - 路由配置

**路由结构**：
```typescript
createHashRouter([
  {
    path: '/',
    element: <MainView />,
    children: [
      { path: 'admin', element: <AdminSystem /> },
      { path: 'dev', element: <DevPanel /> }
    ]
  },
  { path: '/login', element: <Login /> },
  { path: '/settings', element: <Settings /> }
])
```

**路由守卫**：
```typescript
export const routeGuards = {
  requireAuth: (to) => {
    const isAuthenticated = true
    if (!isAuthenticated && to.path !== '/login') {
      return { redirect: '/login' }
    }
  },
  
  requireRole: (to, role) => {
    // 权限检查
  }
}
```

**应该放什么代码**：
- ✅ 路由配置
- ✅ 路由守卫
- ✅ 导航相关逻辑
- ❌ 页面组件（放在 `/modules`）

---

### 9. `/src/middleware` - 中间件

**作用**：HTTP 请求拦截器和统一处理

#### `api.js` - HTTP 中间件

**功能**：

**1. 请求拦截器**
```javascript
apiClient.interceptors.request.use((config) => {
  // 自动添加 Token
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // 防止缓存
  config.params._t = Date.now()
  
  return config
})
```

**2. 响应拦截器**
```javascript
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 统一错误处理
    if (error.response?.status === 401) {
      window.location.hash = '/login'  // 跳转登录
    }
    if (error.response?.status === 403) {
      console.warn('权限不足')
    }
    if (error.response?.status === 500) {
      console.error('服务器错误')
    }
    return Promise.reject(error)
  }
)
```

**3. API 方法封装**
```typescript
export const api = {
  auth: {
    login: (data) => apiClient.post('/auth/login', data),
    logout: () => apiClient.post('/auth/logout'),
    check: () => apiClient.get('/auth/check')
  },
  user: {
    getProfile: () => apiClient.get('/user/profile'),
    updateProfile: (data) => apiClient.put('/user/profile', data)
  },
  get: (url, params) => apiClient.get(url, { params }),
  post: (url, data) => apiClient.post(url, data),
  // ...
}
```

**4. 日志工具**
```typescript
export const logMiddleware = {
  info: (msg, data) => console.log(`[INFO] ${msg}`, data),
  warn: (msg, data) => console.warn(`[WARN] ${msg}`, data),
  error: (msg, data) => console.error(`[ERROR] ${msg}`, data)
}
```

**应该放什么代码**：
- ✅ HTTP 请求拦截器
- ✅ 统一的错误处理
- ✅ 请求/响应日志
- ✅ API 方法封装
- ❌ 业务逻辑（放在 services）

---

### 10. `/src/types` - TypeScript 类型定义

**作用**：存放 TypeScript 类型和接口定义

#### `electron.d.ts` - Electron 类型扩展

**功能**：
- 扩展 `window.electronAPI` 类型
- 定义 IPC 消息类型
- 提供类型安全

**示例**：
```typescript
interface ElectronAPI {
  auth: {
    check: () => Promise<{ role: string, isDeveloper: boolean }>
  }
  window: {
    createPopup: () => void
    closePopup: () => void
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
```

**应该放什么代码**：
- ✅ TypeScript 类型定义
- ✅ 接口声明
- ✅ 全局类型扩展
- ❌ 运行时代码

---

### 11. `/public` - 静态资源目录

**作用**：存放不参与构建的静态文件

**保留的文件**：
- `favicon.ico` - 浏览器标签页图标
- `logo192.png` - 应用 Logo

**已删除的文件**（不需要）：
- ~~`index.html`~~ - 已被 `src/renderer/index.html` 替代
- ~~`manifest.json`~~ - Electron 不需要 PWA manifest
- ~~`robots.txt`~~ - 桌面应用不需要 SEO

**应该放什么代码**：
- ✅ 需要直接访问的静态资源
- ✅  favicon、Logo 图片
- ❌ 源代码（放在 `src`）

---

### 12. `/src/assets` - 资源目录

**作用**：存放需要构建处理的资源文件

**应该放什么**：
- ✅ 全局样式文件
- ✅ 字体文件
- ✅ 需要 import 的图片
- ❌ 业务代码

---

## 四、数据流转示例

### 完整的数据流

```
用户操作
  ↓
组件 (MainView.tsx)
  ↓
调用 Hook (useAuth)
  ↓
调用 Service (aiService)
  ↓
使用 Middleware (api)
  ↓
发送 HTTP 请求
  ↓
后端 API
  ↓
返回响应
  ↓
Middleware 处理（Token、错误）
  ↓
Service 处理业务逻辑
  ↓
Hook 更新状态（isLoading、error）
  ↓
组件重新渲染
  ↓
UI 更新
```

---

## 五、代码组织原则

### 分层架构

```
┌─────────────────────────────────────┐
│         组件层 (Components)          │  ← UI 展示
├─────────────────────────────────────┤
│         Hook 层 (Hooks)              │  ← React 逻辑
├─────────────────────────────────────┤
│        服务层 (Services)             │  ← 业务逻辑
├─────────────────────────────────────┤
│      中间件层 (Middleware)           │  ← HTTP 拦截
├─────────────────────────────────────┤
│         状态层 (Store)               │  ← 全局状态
└─────────────────────────────────────┘
```

### 职责划分

| 层级 | 职责 | 不应该做什么 |
|------|------|-------------|
| Components | UI 渲染 | 不写业务逻辑 |
| Hooks | 状态管理、副作用 | 不直接操作 DOM |
| Services | 业务逻辑、API | 不涉及 React |
| Middleware | HTTP 拦截 | 不处理业务 |
| Store | 状态存储 | 不写复杂逻辑 |

---

## 六、模块间依赖关系

```
modules/mainWindow/MainView.tsx
  ├─ imports @components/Avatar        ← 公共组件
  ├─ imports @hooks/useAuth            ← 权限 Hook
  ├─ imports @store                    ← 状态管理
  └─ imports @middleware/api           ← API 调用
  
@hooks/useAuth
  ├─ imports @store                    ← 读取/更新状态
  └─ imports window.electronAPI        ← Electron API
  
@services/aiService
  └─ imports @services/request         ← HTTP 请求
  
@services/request
  └─ imports @middleware/api           ← 使用中间件
```

---

## 七、最佳实践

### ✅ 推荐做法

1. **业务模块放在 `/modules`**
   ```typescript
   // ✅ 正确
   /modules/userCenter/UserProfile.tsx
   
   // ❌ 错误
   /components/UserProfile.tsx
   ```

2. **公共组件放在 `/components`**
   ```typescript
   // ✅ 正确
   /components/Button/Button.tsx
   
   // ❌ 错误
   /modules/button.tsx
   ```

3. **使用 Hooks 封装逻辑**
   ```typescript
   // ✅ 正确
   const { data } = useUserData()
   
   // ❌ 错误
   useEffect(() => { fetchData() }, [])
   ```

4. **Service 层处理业务**
   ```typescript
   // ✅ 正确
   aiService.chat(message)
   
   // ❌ 错误
   fetch('/api/chat', {...})  // 直接在组件中调用
   ```

5. **使用路径别名**
   ```typescript
   // ✅ 正确
   import { api } from '@middleware/api'
   
   // ❌ 错误
   import { api } from '../../middleware/api'
   ```

---

## 八、开发规范

### 文件命名

- **组件**：PascalCase（`MainView.tsx`）
- **Hooks**：camelCase 以 `use` 开头（`useAuth.ts`）
- **Services**：camelCase（`aiService.ts`）
- **Styles**：`.module.css`（`MainView.module.css`）

### 目录结构

```
模块目录/
├── index.tsx          # 统一导出
├── ModuleName.tsx     # 主组件
├── SubComponent.tsx   # 子组件
└── *.module.css       # 样式文件
```

### 导入顺序

```typescript
// 1. React 和第三方库
import React from 'react'
import axios from 'axios'

// 2. 绝对路径导入
import { api } from '@middleware/api'
import { useAuth } from '@hooks/useAuth'

// 3. 相对路径导入
import styles from './MyComponent.module.css'
import { SubComponent } from './SubComponent'
```

---

## 九、总结

### 核心思想

1. **分层清晰**：每层只负责单一职责
2. **模块独立**：每个模块自包含
3. **代码复用**：公共逻辑抽离到 Hooks/Components
4. **类型安全**：TypeScript 全覆盖
5. **完全可控**：手动管理所有配置

### 快速定位

- **找页面** → `/modules`
- **找组件** → `/components`
- **找逻辑** → `/hooks` + `/services`
- **找状态** → `/store`
- **找 API** → `/middleware` + `/services`
- **找路由** → `/router`

这就是整个项目的完整架构和运转方式。
