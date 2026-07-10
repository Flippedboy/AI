/**
 * 智扫通自定义日志工具
 * 替代 @lark-apaas/client-toolkit/logger
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class AppLogger {
  private prefix = '[智扫通]';

  info(...args: unknown[]) {
    console.log(this.prefix, ...args);
  }

  warn(...args: unknown[]) {
    console.warn(this.prefix, ...args);
  }

  error(msg: string, ...args: unknown[]) {
    console.error(this.prefix, msg, ...args);
  }

  debug(...args: unknown[]) {
    console.debug(this.prefix, ...args);
  }
}

export const logger = new AppLogger();
export default logger;
