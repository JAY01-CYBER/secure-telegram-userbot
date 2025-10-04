import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import express from 'express';

import { securityCheck } from '@utils/security';
import { logger } from '@utils/logger';
import { messageHandler } from '@handlers/messageHandler';

// Initialize
const app = express();
const port = process.env.PORT || 3000;

// Security first
securityCheck();

// Telegram client
const client = new TelegramClient(
  new StringSession(process.env.SESSION_STRING!),
  parseInt(process.env.API_ID!),
  process.env.API_HASH!,
  {
    connectionRetries: 5,
    useWSS: true,
    deviceModel: 'Secure-Userbot',
    systemVersion: 'Node.js',
    appVersion: '2.0.0'
  }
);

// Web server
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: '🛡️ Secure Userbot Active',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime()
  });
});

// Start function
async function initialize() {
  try {
    logger.info('🚀 Initializing Secure Telegram Userbot...');
    
    await client.start({
      phoneNumber: async () => '',
      password: async () => '',
      phoneCode: async () => '',
      onError: (err) => logger.error('Client error:', err),
    });

    const me = await client.getMe();
    logger.success(`✅ Userbot started for: ${me.firstName} (@${me.username})`);
    
    // Add event handlers
    client.addEventHandler(messageHandler);
    logger.info('📝 Message handler registered');

    // Start web server
    app.listen(port, () => {
      logger.info(`🌐 Web server running on port ${port}`);
    });

  } catch (error) {
    logger.error('❌ Startup failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🛑 Shutting down gracefully...');
  await client.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🔻 Received SIGTERM, shutting down...');
  await client.disconnect();
  process.exit(0);
});

// Start the application
initialize();
