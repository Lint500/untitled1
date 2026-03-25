import fs from 'fs';
import path from 'path';

/**
 * 日志服务
 * 负责记录和存储应用日志，对接后端监控
 */
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

export class LogService {
  private logFile: string;
  private logs: LogEntry[] = [];
  private maxLogsInMemory = 1000;

  constructor() {
    // 确保日志目录存在
    const logDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const date = new Date().toISOString().split('T')[0];
    this.logFile = path.join(logDir, `app-${date}.log`);
  }

  /**
   * 记录日志
   */
  log(
    data: { message: string; data?: any; level?: string } | string,
    level: 'info' | 'warn' | 'error' | 'debug' = 'info'
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: typeof data === 'string' ? data : data.message,
      data: typeof data === 'object' ? data.data : undefined,
    };

    // 添加到内存
    this.logs.push(entry);
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs.shift();
    }

    // 写入文件
    this.writeToFile(entry);

    // 发送到渲染进程（如果需要）
    this.sendToRenderer(entry);
  }

  /**
   * 记录信息日志
   */
  info(message: string, data?: any): void {
    this.log({ message, data }, 'info');
  }

  /**
   * 记录警告日志
   */
  warn(message: string, data?: any): void {
    this.log({ message, data }, 'warn');
  }

  /**
   * 记录错误日志
   */
  error(message: string, data?: any): void {
    this.log({ message, data }, 'error');
  }

  /**
   * 记录调试日志
   */
  debug(message: string, data?: any): void {
    this.log({ message, data }, 'debug');
  }

  /**
   * 获取最近的日志
   */
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * 获取所有日志文件内容
   */
  getAllLogs(): string {
    if (fs.existsSync(this.logFile)) {
      return fs.readFileSync(this.logFile, 'utf-8');
    }
    return '';
  }

  /**
   * 清空内存中的日志
   */
  clearMemoryLogs(): void {
    this.logs = [];
  }

  /**
   * 写入到文件
   */
  private writeToFile(entry: LogEntry): void {
    try {
      const logLine = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${
        entry.data ? ' - ' + JSON.stringify(entry.data) : ''
      }\n`;
      fs.appendFileSync(this.logFile, logLine);
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  }

  /**
   * 发送到渲染进程
   */
  private sendToRenderer(entry: LogEntry): void {
    const { BrowserWindow } = require('electron');
    const windows = BrowserWindow.getAllWindows();
    
    windows.forEach((window) => {
      window.webContents.send('log:update', entry);
    });
  }

  /**
   * 导出日志到指定路径
   */
  exportLogs(filePath: string): void {
    const content = this.logs
      .map(
        (entry) =>
          `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${
            entry.data ? ' - ' + JSON.stringify(entry.data) : ''
          }`
      )
      .join('\n');
    
    fs.writeFileSync(filePath, content);
  }
}

// 导出单例实例
export const logService = new LogService();
