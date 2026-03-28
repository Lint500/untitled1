import { createHashRouter } from 'react-router-dom'
import CognitiveConsole from '../modules/mainWindow/CognitiveConsole'

export const router = createHashRouter([
  {
    path: '/',
    element: <CognitiveConsole />
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
