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
    enableFileHandling: true // Enabled for media features
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
    enableMetrics: true // Enabled for stats
  }
};

// Enhanced Bot state management with all features
const botState: BotState = {
  isConnected: false,
  startTime: new Date(),
  totalMessages: 0,
  activeChats: 0,
  features: {
    // Core features
    commands: config.features.enableCommands,
    events: config.features.enableEvents,
    webServer: config.features.enableWebServer,
    fileHandling: config.features.enableFileHandling,
    
    // Media & File features
    media: true,
    fileOperations: true,
    
    // Group Management features
    groupManagement: true,
    adminTools: true,
    
    // Utility features
    utilities: true,
    calculator: true,
    weather: true,
    
    // Fun & Entertainment features
    games: true,
    entertainment: true,
    quotes: true,
    
    // Download & Information features
    downloads: true,
    information: true,
    
    // Automation features
    automation: true,
    autoReply: true,
    reminders: true,
    
    // Security features
    security: true,
    antiSpam: true,
    
    // User features
    statistics: true,
    userTracking: true,
    
    // Admin features
    broadcast: true,
    systemControl: true
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
    deviceModel: 'Ultimate-Userbot-Server',
    systemVersion: 'Node.js v18+',
    appVersion: '3.0.0',
    langCode: 'en',
    systemLangCode: 'en',
    timeout: 10000,
    requestRetries: 3,
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

// Root endpoint - Complete info
app.get('/', (req, res) => {
  const uptime = Helpers.formatUptime(process.uptime());
  const memory = Helpers.getMemoryUsage();
  const activeFeatures = Object.keys(botState.features).filter((f: string) => 
    botState.features[f as keyof typeof botState.features]
  );
  
  res.json({
    status: '🚀 Ultimate Telegram Userbot - ACTIVE',
    version: '3.0.0',
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
      totalMessages: botState.totalMessages,
      activeChats: botState.activeChats
    },
    features: {
      total: activeFeatures.length,
      enabled: activeFeatures
    },
    timestamp: new Date().toISOString(),
    endpoints: [
      '/health - Health check',
      '/status - Detailed status',
      '/info - Bot information',
      '/features - Available features'
    ]
  });
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  const memory = Helpers.getMemoryUsage();
  const healthStatus = {
    status: botState.isConnected ? 'healthy' : 'unhealthy',
    uptime: process.uptime(),
    memory: memory,
    telegram: {
      connected: botState.isConnected,
      connectionTime: botState.startTime
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform
    },
    timestamp: new Date().toISOString(),
    version: '3.0.0'
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
      architecture: process.arch,
      memory: memory,
      pid: process.pid,
      uptime: uptime
    },
    config: {
      ...config,
      telegram: {
        apiId: config.telegram.apiId,
        apiHash: '***HIDDEN***',
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
    name: 'Ultimate Telegram Userbot',
    description: 'A feature-rich Telegram userbot built with Node.js and TypeScript',
    version: '3.0.0',
    author: 'Your Name',
    repository: 'https://github.com/yourusername/telegram-userbot',
    
    features: [
      '🔒 Secure session management',
      '🚀 Fast Node.js + TypeScript',
      '🛡️ Environment variable protection',
      '📊 Health monitoring',
      '⚡ Modern command system',
      '🔧 Easy deployment on Render',
      '🎮 25+ Commands & Features',
      '🤖 Advanced automation',
      '🛡️ Security & anti-spam',
      '📱 Media & file handling'
    ],
    
    technology: [
      'Node.js v18+',
      'TypeScript',
      'Telegram MTProto',
      'Express.js',
      'Render.com'
    ],
    
    statistics: {
      totalCommands: 25,
      categories: 10,
      features: Object.keys(botState.features).filter((f: string) => 
        botState.features[f as keyof typeof botState.features]
      ).length
    }
  });
});

// Features endpoint - Show all available features
app.get('/features', (req, res) => {
  const features = {
    'Basic Commands': ['.ping', '.status', '.speed', '.echo', '.help'],
    'Media & File': ['.caption', '.rename'],
    'Group Management': ['.ban', '.members'],
    'Utilities': ['.weather', '.calc'],
    'Fun & Games': ['.dice', '.joke', '.quiz', '.love', '.quote'],
    'Download & Info': ['.ytdl', '.ud', '.wikipedia'],
    'Automation': ['.autoreply', '.addar', '.reminder'],
    'Security': ['.antispam', '.addfilter'],
    'User Features': ['.stats'],
    'Admin Features': ['.broadcast', '.restart']
  };

  res.json({
    totalCategories: Object.keys(features).length,
    totalCommands: Object.values(features).flat().length,
    features: features
  });
});

// Metrics endpoint for monitoring
app.get('/metrics', (req, res) => {
  const memory = Helpers.getMemoryUsage();
  const uptime = process.uptime();
  
  res.json({
    timestamp: new Date().toISOString(),
    uptime: uptime,
    memory: memory,
    process: {
      pid: process.pid,
      platform: process.platform,
      nodeVersion: process.version,
      uptime: process.uptime()
    },
    bot: {
      connected: botState.isConnected,
      startTime: botState.startTime,
      totalMessages: botState.totalMessages
    }
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
      'GET /info',
      'GET /features',
      'GET /metrics'
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
    logger.info('🚀 Starting Ultimate Telegram Userbot...');
    logger.info('='.repeat(50));
    logger.info('🎯 FEATURE SUMMARY:');
    logger.info(`   • Basic Commands: 5 commands`);
    logger.info(`   • Media & File: 2 commands`);
    logger.info(`   • Group Management: 2 commands`);
    logger.info(`   • Utilities: 2 commands`);
    logger.info(`   • Fun & Games: 5 commands`);
    logger.info(`   • Download & Info: 3 commands`);
    logger.info(`   • Automation: 3 commands`);
    logger.info(`   • Security: 2 commands`);
    logger.info(`   • User Features: 1 command`);
    logger.info(`   • Admin Features: 2 commands`);
    logger.info('='.repeat(50));
    
    logger.info('📋 Configuration:');
    logger.info(`   • Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`   • Web Server: ${config.features.enableWebServer ? 'Enabled' : 'Disabled'}`);
    logger.info(`   • Commands: ${config.features.enableCommands ? 'Enabled' : 'Disabled'}`);
    logger.info(`   • Events: ${config.features.enableEvents ? 'Enabled' : 'Disabled'}`);
    logger.info(`   • File Handling: ${config.features.enableFileHandling ? 'Enabled' : 'Disabled'}`);
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
    logger.success(`👤 Logged in as: ${me.firstName} (@${me.username || 'N/A'})`);
    logger.success(`🆔 User ID: ${me.id}`);
    logger.success(`📱 Phone: ${me.phone || 'Not available'}`);

    // Initialize and register event handlers
    if (config.features.enableEvents) {
      logger.info('📝 Registering event handlers...');
      const eventHandler = new EventHandler(client);
      const handlers = eventHandler.getHandlers();
      
      client.addEventHandler(handlers.newMessage, new (await import('telegram/events')).NewMessage());
      client.addEventHandler(handlers.editedMessage, new (await import('telegram/events')).NewMessage());
      
      if (config.features.enableCommands) {
        logger.info('🔧 Command system enabled - 25+ commands available');
      }
      
      logger.success('✅ All event handlers registered successfully');
    }

    // Start web server if enabled
    if (config.features.enableWebServer) {
      await startWebServer();
    }

    // Final startup message
    const memory = Helpers.getMemoryUsage();
    logger.success('🎉 ULTIMATE TELEGRAM USERBOT STARTED SUCCESSFULLY!');
    logger.info('='.repeat(50));
    logger.info(`💾 Memory usage: ${memory.rss}MB RSS, ${memory.heapUsed}MB Heap`);
    logger.info(`⏰ Startup time: ${new Date().toISOString()}`);
    logger.info(`🚀 Ready to process messages with 25+ features!`);
    logger.info(`💡 Use '.help' to see all available commands`);
    logger.info('='.repeat(50));

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
      logger.info(`   • Dashboard: http://localhost:${port}/`);
      logger.info(`   • Health: http://localhost:${port}/health`);
      logger.info(`   • Status: http://localhost:${port}/status`);
      logger.info(`   • Features: http://localhost:${port}/features`);
      logger.info(`   • Metrics: http://localhost:${port}/metrics`);
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

// Memory usage monitoring
setInterval(() => {
  const memory = Helpers.getMemoryUsage();
  if (memory.heapUsed > 200) { // 200MB threshold
    logger.info(`⚠️ High memory usage: ${memory.heapUsed}MB Heap`); // FIXED: warning → warn
  }
}, 60000); // Check every minute

// Periodic status logging
setInterval(() => {
  const memory = Helpers.getMemoryUsage();
  const uptime = Helpers.formatUptime(process.uptime());
  logger.info(`📊 Status - Uptime: ${uptime}, Memory: ${memory.heapUsed}MB`);
}, 300000); // Log every 5 minutes

// ==================== APPLICATION START ====================

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  try {
    logger.info('='.repeat(60));
    logger.info('🚀 ULTIMATE TELEGRAM USERBOT v3.0');
    logger.info('='.repeat(60));
    logger.info('🎯 25+ Features | Node.js + TypeScript | Secure & Fast');
    logger.info('='.repeat(60));
    
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

// Export for testing purposes
export { client, app, config, botState };
