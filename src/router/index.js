// 自己控制路由配置
import { createHashRouter } from 'react-router-dom'

// 页面组件
import MainView from '../modules/mainWindow/MainView.jsx'
import AdminSystem from '../modules/adminSystem/index.jsx'
import DevPanel from '../modules/devPanel/index.jsx'

// 路由配置
export const router = createHashRouter([
  {
    path: '/',
    element: <MainView />,
    children: [
      {
        path: 'admin',
        element: <AdminSystem />
      },
      {
        path: 'dev',
        element: <DevPanel />
      }
    ]
  },
  {
    path: '/login',
    element: <div>Login Page</div>
  },
  {
    path: '/settings',
    element: <div>Settings Page</div>
  }
])

// 路由守卫 - 自己实现中间件
export const routeGuards = {
  // 认证守卫
  requireAuth: (to) => {
    const isAuthenticated = true // 从你的状态管理获取
    if (!isAuthenticated && to.path !== '/login') {
      return { redirect: '/login' }
    }
    return null
  },
  
  // 权限守卫
  requireRole: (to, role) => {
    const userRole = 'user' // 从你的状态管理获取
    if (role === 'admin' && userRole !== 'admin') {
      return { redirect: '/' }
    }
    return null
  }
}
