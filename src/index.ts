import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import express from 'express';
import { securityCheck } from './utils/security.js';
import { logger } from './utils/logger.js';
import { Helpers } from './utils/helpers.js';
import { EventHandler } from './handlers/eventHandler.js';
import type { BotConfiguration, BotState } from './types/index.js';

// Initialize Express
const app = express();
const port = process.env.PORT || 3000;

// Security check first - Critical!
logger.info('🛡️ Running security checks...');
securityCheck();
logger.success('✅ Security checks passed');

// Bot configuration with environment variables
const config: BotConfiguration = {
  telegram: {
    apiId: parseInt(process.env.API_ID!),
    apiHash: process.env.API_HASH!,
    sessionString: process.env.SESSION_STRING!
  },
  features: {
    enableCommands: true,
    enableEvents: true,
    enableWebServer: true,
    enableFileHandling: false
  },
  security: {
    ownerId: BigInt(process.env.OWNER_ID || '0'),
    adminIds: [],
    blockedUsers: [],
    rateLimit: {
      enabled: true,
      maxRequests: 10,
      windowMs: 60000
    }
  },
  logging: {
    level: process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug' || 'info',
    maxSize: 50 * 1024 * 1024 // 50MB
  },
  webServer: {
    port: parseInt(process.env.PORT || '3000'),
    enableHealthCheck: true,
    enableMetrics: false
  }
};

// Bot state management
const botState: BotState = {
  isConnected: false,
  startTime: new Date(),
  totalMessages: 0,
  activeChats: 0,
  features: {
    commands: config.features.enableCommands,
    events: config.features.enableEvents,
    webServer: config.features.enableWebServer,
    fileHandling: config.features.enableFileHandling
  }
};

// Telegram client with enhanced configuration
const client = new TelegramClient(
  new StringSession(config.telegram.sessionString),
  config.telegram.apiId,
  config.telegram.apiHash,
  {
    connectionRetries: 5,
    useWSS: true, // WebSocket for better connection
    deviceModel: 'Secure-Userbot-Server',
    systemVersion: 'Node.js v18+',
    appVersion: '2.0.0',
    langCode: 'en',
    systemLangCode: 'en',
    baseLogger: logger as any,
    timeout: 10000,
    requestRetries: 3,
    connectionParams: {
      transport: 'websocket'
    }
  }
);

// ==================== WEB SERVER SETUP ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic middleware for logging
app.use((req, res, next) => {
  logger.info(`🌐 ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Root endpoint - Basic info
app.get('/', (req, res) => {
  const uptime = Helpers.formatUptime(process.uptime());
  const memory = Helpers.getMemoryUsage();
  const activeFeatures = Object.keys(botState.features).filter(f => botState.features[f]);
  
  res.json({
    status: '🛡️ Secure Telegram Userbot - ACTIVE',
    version: '2.0.0',
    platform: 'Node.js + TypeScript',
    environment: process.env.NODE_ENV || 'development',
    uptime: uptime,
    memory: {
      rss: `${memory.rss}MB`,
      heapUsed: `${memory.heapUsed}MB`,
      heapTotal: `${memory.heapTotal}MB`
    },
    bot: {
      connected: botState.isConnected,
      startTime: botState.startTime,
      totalMessages: botState.totalMessages
    },
    features: activeFeatures,
    timestamp: new Date().toISOString(),
    endpoints: [
      '/health - Health check',
      '/status - Detailed status',
      '/info - Bot information'
    ]
  });
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  const healthStatus = {
    status: botState.isConnected ? 'healthy' : 'unhealthy',
    uptime: process.uptime(),
    memory: Helpers.getMemoryUsage(),
    telegram: {
      connected: botState.isConnected,
      connectionTime: botState.startTime
    },
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  };

  // Return appropriate status code
  if (botState.isConnected) {
    res.status(200).json(healthStatus);
  } else {
    res.status(503).json(healthStatus);
  }
});

// Detailed status endpoint
app.get('/status', (req, res) => {
  const memory = Helpers.getMemoryUsage();
  const uptime = process.uptime();
  
  res.json({
    botState: {
      ...botState,
      uptime: Helpers.formatUptime(uptime),
      currentTime: new Date().toISOString()
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: memory,
      pid: process.pid,
      uptime: uptime
    },
    config: {
      ...config,
      telegram: {
        apiId: config.telegram.apiId,
        apiHash: '***HIDDEN***', // Hide sensitive info
        sessionString: '***HIDDEN***'
      },
      security: {
        ...config.security,
        ownerId: config.security.ownerId.toString(),
        adminIds: config.security.adminIds.map(id => id.toString()),
        blockedUsers: config.security.blockedUsers.map(id => id.toString())
      }
    }
  });
});

// Bot information endpoint
app.get('/info', (req, res) => {
  res.json({
    name: 'Secure Telegram Userbot',
    description: 'A secure and modern Telegram userbot built with Node.js and TypeScript',
    version: '2.0.0',
    author: 'Your Name',
    repository: 'https://github.com/yourusername/telegram-userbot',
    features: [
      '🔒 Secure session management',
      '🚀 Fast Node.js + TypeScript',
      '🛡️ Environment variable protection',
      '📊 Health monitoring',
      '⚡ Modern command system',
      '🔧 Easy deployment on Render'
    ],
    commands: [
      '.ping - Test bot response',
      '.status - Show bot status', 
      '.speed - Test response speed',
      '.echo <text> - Echo your message',
      '.help - Show all commands'
    ],
    technology: [
      'Node.js v18+',
      'TypeScript',
      'Telegram MTProto',
      'Express.js',
      'Render.com'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /',
      'GET /health', 
      'GET /status',
      'GET /info'
    ]
  });
});

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  logger.error('Web server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// ==================== TELEGRAM BOT SETUP ====================

/**
 * Initialize and start the Telegram userbot
 */
async function initializeUserbot(): Promise<void> {
  try {
    logger.info('🚀 Starting Secure Telegram Userbot...');
    logger.info('📋 Configuration Summary:');
    logger.info(`   • Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`   • Web Server: ${config.features.enableWebServer ? 'Enabled' : 'Disabled'}`);
    logger.info(`   • Commands: ${config.features.enableCommands ? 'Enabled' : 'Disabled'}`);
    logger.info(`   • Events: ${config.features.enableEvents ? 'Enabled' : 'Disabled'}`);
    logger.info(`   • Port: ${config.webServer.port}`);
    
    // Start Telegram client
    logger.info('🔑 Authenticating with Telegram...');
    
    await client.start({
      phoneNumber: async () => {
        throw new Error('Phone authentication not supported in production');
      },
      password: async () => {
        throw new Error('Password authentication not supported in production');
      },
      phoneCode: async () => {
        throw new Error('Phone code authentication not supported in production');
      },
      onError: (err) => {
        logger.error('🔐 Authentication error:', err);
        throw err;
      },
    });

    // Get user information
    const me = await client.getMe();
    botState.isConnected = true;
    
    logger.success('✅ Telegram authentication successful!');
    logger.success(`👤 Logged in as: ${me.firstName} (@${me.username})`);
    logger.success(`🆔 User ID: ${me.id}`);
    logger.success(`📱 Phone: ${me.phone || 'Not available'}`);

    // Initialize and register event handlers
    if (config.features.enableEvents) {
      logger.info('📝 Registering event handlers...');
      const eventHandler = new EventHandler(client);
      const handlers = eventHandler.getHandlers();
      
      client.addEventHandler(handlers.newMessage);
      client.addEventHandler(handlers.editedMessage);
      
      if (config.features.enableCommands) {
        logger.info('🔧 Command system enabled');
      }
      
      logger.success('✅ Event handlers registered successfully');
    }

    // Start web server if enabled
    if (config.features.enableWebServer) {
      await startWebServer();
    }

    // Final startup message
    const memory = Helpers.getMemoryUsage();
    logger.success('🎉 Secure Telegram Userbot started successfully!');
    logger.info(`💾 Memory usage: ${memory.rss}MB RSS, ${memory.heapUsed}MB Heap`);
    logger.info(`⏰ Startup time: ${new Date().toISOString()}`);
    logger.info(`🚀 Ready to process messages...`);

  } catch (error) {
    logger.error('❌ Failed to initialize userbot:', error);
    process.exit(1);
  }
}

/**
 * Start the web server for health checks and monitoring
 */
async function startWebServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      logger.success(`🌐 Web server running on port ${port}`);
      logger.info(`   • Health check: http://localhost:${port}/health`);
      logger.info(`   • Status: http://localhost:${port}/status`);
      logger.info(`   • Info: http://localhost:${port}/info`);
      resolve();
    });

    server.on('error', (error) => {
      logger.error('❌ Web server failed to start:', error);
      reject(error);
    });
  });
}

// ==================== PROCESS MANAGEMENT ====================

/**
 * Graceful shutdown handler
 */
async function performShutdown(): Promise<void> {
  logger.info('🛑 Initiating graceful shutdown...');
  
  try {
    botState.isConnected = false;
    
    // Disconnect Telegram client
    logger.info('📡 Disconnecting from Telegram...');
    await client.disconnect();
    logger.success('✅ Telegram disconnected');
    
    // Add a small delay to ensure everything is cleaned up
    await Helpers.delay(1000);
    
    logger.success('🎯 Shutdown completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Process signal handlers for graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🔔 Received SIGINT (Ctrl+C)');
  await performShutdown();
});

process.on('SIGTERM', async () => {
  logger.info('🔔 Received SIGTERM (Render shutdown)');
  await performShutdown();
});

// Error handlers for unexpected issues
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  // Don't exit immediately, let the process try to recover
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit immediately, let the process try to recover
});

// Memory usage monitoring (optional)
if (config.logging.level === 'debug') {
  setInterval(() => {
    const memory = Helpers.getMemoryUsage();
    if (memory.heapUsed > 200) { // 200MB threshold
      logger.warning(`High memory usage: ${memory.heapUsed}MB Heap`);
    }
  }, 60000); // Check every minute
}

// ==================== APPLICATION START ====================

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  try {
    logger.info('='.repeat(50));
    logger.info('🛡️  SECURE TELEGRAM USERBOT');
    logger.info('='.repeat(50));
    
    await initializeUserbot();
    
  } catch (error) {
    logger.error('💥 Critical error during application startup:', error);
    process.exit(1);
  }
}

// Start the application
main().catch(error => {
  logger.error('💥 Fatal error in main function:', error);
  process.exit(1);
});

// Export for testing purposes (optional)
export { client, app, config, botState };
