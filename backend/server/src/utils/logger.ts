export const logger = {
  info: (...args: unknown[]) => {
    if (process.env.LOG_LEVEL === 'silent') return;
    // keep info in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (process.env.LOG_LEVEL === 'silent') return;
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.error(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (process.env.LOG_LEVEL === 'debug') {
      // eslint-disable-next-line no-console
      console.debug(...args);
    }
  },
};

export default logger;
