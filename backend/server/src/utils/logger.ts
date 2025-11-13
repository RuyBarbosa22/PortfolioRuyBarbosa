export const logger = {
  info: (...args: unknown[]) => {
    if (process.env.LOG_LEVEL === 'silent') return;
    if (process.env.NODE_ENV !== 'test') {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (process.env.LOG_LEVEL === 'silent') return;
    if (process.env.NODE_ENV !== 'test') {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(...args);
    }
  },
};

export default logger;
