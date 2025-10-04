import { Api } from 'telegram';
import type { TelegramClient } from 'telegram';
import { logger } from '../utils/logger.js';
import { Helpers } from '../utils/helpers.js';
import type { CommandContext, CommandResult, UserID, ChatID } from '../types/index.js';

export class CommandHandler {
  private client: TelegramClient;

  constructor(client: TelegramClient) {
    this.client = client;
  }

  async handlePing(message: any): Promise<CommandResult> {
    try {
      await message.reply({
        message: '🏓 **Pong!**\n⚡ Node.js + TypeScript Userbot\n🛡️ Secure & Fast',
        parseMode: 'html'
      });
      
      logger.info('Ping command executed successfully');
      
      return {
        success: true,
        message: 'Pong response sent',
        executionTime: 0,
        userId: message.senderId,
        chatId: message.chatId
      };
    } catch (error) {
      logger.error('Ping command failed:', error);
      return {
        success: false,
        error: 'Failed to execute ping command',
        executionTime: 0,
        userId: message.senderId,
        chatId: message.chatId
      };
    }
  }

  async handleStatus(message: any): Promise<CommandResult> {
    const startTime = Date.now();
    
    try {
      const me = await this.client.getMe();
      const uptime = process.uptime();
      const memory = Helpers.getMemoryUsage();
      
      const statusMessage = `🤖 **Userbot Status**\n\n` +
        `✅ **Online:** Yes\n` +
        `👤 **User:** ${me.firstName}\n` +
        `📱 **Username:** @${me.username || 'N/A'}\n` +
        `🆔 **ID:** ${me.id}\n` +
        `⏰ **Uptime:** ${Helpers.formatUptime(uptime)}\n` +
        `💾 **Memory:** ${memory.heapUsed}MB / ${memory.heapTotal}MB\n` +
        `🛡️ **Security:** Enabled\n` +
        `🚀 **Platform:** Node.js + TypeScript\n` +
        `🔧 **Version:** 2.0.0`;

      await message.reply({
        message: statusMessage,
        parseMode: 'html'
      });

      const executionTime = Date.now() - startTime;
      logger.info(`Status command executed in ${executionTime}ms`);

      return {
        success: true,
        message: 'Status information sent',
        executionTime,
        userId: message.senderId,
        chatId: message.chatId,
        data: { uptime, memory }
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Status command failed:', error);
      
      return {
        success: false,
        error: 'Failed to fetch status information',
        executionTime,
        userId: message.senderId,
        chatId: message.chatId
      };
    }
  }

  async handleSpeed(message: any): Promise<CommandResult> {
    const startTime = Date.now();
    
    try {
      const tempMsg = await message.reply({ 
        message: '⏳ Testing speed...' 
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      let performance = 'Excellent ⚡';
      if (responseTime > 1000) performance = 'Good 👍';
      if (responseTime > 3000) performance = 'Slow 🐢';

      const speedMessage = `🚀 **Speed Test Results**\n\n` +
        `📊 **Response Time:** ${responseTime}ms\n` +
        `⚡ **Performance:** ${performance}\n` +
        `🕒 **Test Time:** ${Helpers.getTimestamp()}`;

      await this.client.editMessage(tempMsg.chatId!, { 
        message: tempMsg.id, 
        text: speedMessage,
        parseMode: 'html'
      });

      logger.info(`Speed test completed in ${responseTime}ms - ${performance}`);

      return {
        success: true,
        message: 'Speed test completed',
        executionTime: responseTime,
        userId: message.senderId,
        chatId: message.chatId,
        data: { responseTime, performance }
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Speed test failed:', error);
      
      return {
        success: false,
        error: 'Speed test failed',
        executionTime,
        userId: message.senderId,
        chatId: message.chatId
      };
    }
  }

  async handleHelp(message: any): Promise<CommandResult> {
    try {
      const helpMessage = `🤖 **Available Commands**\n\n` +
        `.ping - Test bot response\n` +
        `.status - Check bot status\n` +
        `.speed - Test speed\n` +
        `.help - Show this help`;

      await message.reply({
        message: helpMessage,
        parseMode: 'html'
      });

      return {
        success: true,
        message: 'Help sent',
        executionTime: 0,
        userId: message.senderId,
        chatId: message.chatId
      };
    } catch (error) {
      logger.error('Help command failed:', error);
      return {
        success: false,
        error: 'Failed to send help',
        executionTime: 0,
        userId: message.senderId,
        chatId: message.chatId
      };
    }
  }

  async handleEcho(message: any, args: string[]): Promise<CommandResult> {
    try {
      if (args.length === 0) {
        await message.reply({
          message: '❌ Usage: `.echo <message>`',
          parseMode: 'html'
        });
        return {
          success: false,
          error: 'No message',
          executionTime: 0,
          userId: message.senderId,
          chatId: message.chatId
        };
      }

      await message.reply({
        message: `📢 ${args.join(' ')}`,
        parseMode: 'html'
      });

      return {
        success: true,
        message: 'Echo sent',
        executionTime: 0,
        userId: message.senderId,
        chatId: message.chatId
      };
    } catch (error) {
      logger.error('Echo command failed:', error);
      return {
        success: false,
        error: 'Failed to echo',
        executionTime: 0,
        userId: message.senderId,
        chatId: message.chatId
      };
    }
  }

  async handleRestart(message: any): Promise<CommandResult> {
    try {
      await message.reply({
        message: '🔄 **Restarting...**\n\nBot will restart shortly.',
        parseMode: 'html'
      });

      // Simulate restart
      setTimeout(() => process.exit(0), 2000);

      return {
        success: true,
        message: 'Restart initiated',
        executionTime: 0,
        userId: message.senderId,
        chatId: message.chatId
      };
    } catch (error) {
      logger.error('Restart command failed:', error);
      return {
        success: false,
        error: 'Failed to restart',
        executionTime: 0,
        userId: message.senderId,
        chatId: message.chatId
      };
    }
  }

  async handleUnknown(message: any, command: string): Promise<CommandResult> {
    try {
      await message.reply({
        message: `❓ **Unknown Command**\n\n\`.${command}\` is not recognized.\nUse \`.help\` for available commands.`,
        parseMode: 'html'
      });

      return {
        success: false,
        error: `Unknown command: ${command}`,
        executionTime: 0,
        userId: message.senderId,
        chatId: message.chatId
      };
    } catch (error) {
      logger.error('Unknown command failed:', error);
      return {
        success: false,
        error: 'Failed to handle unknown command',
        executionTime: 0,
        userId: message.senderId,
        chatId: message.chatId
      };
    }
  }
}
