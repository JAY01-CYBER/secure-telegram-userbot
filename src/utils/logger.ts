export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`📘 [INFO] ${message}`, ...args);
  },
  
  success: (message: string, ...args: any[]) => {
    console.log(`📗 [SUCCESS] ${message}`, ...args);
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`📕 [ERROR] ${message}`, ...args);
  },
  
  message: (message: string, ...args: any[]) => {
    console.log(`📧 [MESSAGE] ${message}`, ...args);
  },
  
  security: (message: string, ...args: any[]) => {
    console.log(`🛡️ [SECURITY] ${message}`, ...args);
  }
};
