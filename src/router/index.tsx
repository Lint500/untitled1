import { createHashRouter } from 'react-router-dom'
import MainView from '../modules/mainWindow/MainView'

export const router = createHashRouter([
  {
    path: '/',
    element: <MainView />
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
