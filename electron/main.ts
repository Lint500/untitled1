import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { WindowService } from './services/windowService';
import { AuthService } from './services/authService';
import { LogService } from './services/logService';

let mainWindow: BrowserWindow | null = null;
let featurePopup: BrowserWindow | null = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.ts'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createFeaturePopup() {
  if (featurePopup) {
    featurePopup.focus();
    return;
  }

  featurePopup = new BrowserWindow({
    width: 400,
    height: 600,
    parent: mainWindow || undefined,
    modal: false,
    show: false,
    frame: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.ts'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    featurePopup.loadURL('http://localhost:3000/feature-popup');
  } else {
    featurePopup.loadFile(path.join(__dirname, '../build/index.html'), {
      hash: '/feature-popup',
    });
  }

  featurePopup.on('closed', () => {
    featurePopup = null;
  });
}

app.whenReady().then(() => {
  createMainWindow();

  const authService = new AuthService();
  const logService = new LogService();

  ipcMain.handle('auth:check', () => {
    return authService.checkPermission();
  });

  ipcMain.handle('window:createPopup', () => {
    createFeaturePopup();
  });

  ipcMain.handle('window:closePopup', () => {
    if (featurePopup) {
      featurePopup.close();
      featurePopup = null;
    }
  });

  ipcMain.handle('log:send', (_, data) => {
    logService.log(data);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
