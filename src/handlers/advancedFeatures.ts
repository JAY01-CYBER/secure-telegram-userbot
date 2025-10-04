import { Api } from 'telegram';
import type { TelegramClient } from 'telegram';
import { logger } from '../utils/logger.js';
import { Helpers } from '../utils/helpers.js';
import type { CommandContext, CommandResult } from '../types/index.js';

export class AdvancedFeatures {
  private client: TelegramClient;
  private userStats: Map<bigint, { messages: number; lastSeen: Date }> = new Map(); // FIXED: big64 → bigint
  private reminders: Map<string, { userId: bigint; time: Date; message: string }> = new Map(); // FIXED: big64 → bigint
  private quotes: string[] = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "Strive not to be a success, but rather to be of value. - Albert Einstein",
    "The way to get started is to quit talking and begin doing. - Walt Disney"
  ];

  constructor(client: TelegramClient) {
    this.client = client;
    this.startReminderChecker();
  }

  // ==================== DOWNLOAD FEATURES ====================
  async handleYouTubeDownload(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message, args } = ctx;
    
    try {
      if (args.length === 0) {
        await message.reply({
          message: '❌ **Usage:** `.ytdl <YouTube URL>`\nExample: `.ytdl https://youtube.com/watch?v=...`',
          parseMode: 'html'
        });
        return { success: false, error: 'No URL', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      const url = args[0];
      
      await message.reply({
        message: `📥 **YouTube Downloader**\n\n` +
                 `🔗 **URL:** ${Helpers.truncateText(url, 50)}\n` +
                 `⏳ **Status:** Processing...\n\n` +
                 `_YouTube download functionality requires additional setup with ytdl-core_`,
        parseMode: 'html'
      });

      return { success: true, message: 'YouTube download initiated', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('YouTube download failed:', error);
      return { success: false, error: 'Download failed', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  // ==================== INFORMATION FEATURES ====================
  async handleUrbanDictionary(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message, args } = ctx;
    
    try {
      if (args.length === 0) {
        await message.reply({
          message: '❌ **Usage:** `.ud <word>`\nExample: `.ud lit`',
          parseMode: 'html'
        });
        return { success: false, error: 'No word', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      const word = args[0];
      
      await message.reply({
        message: `📚 **Urban Dictionary**\n\n` +
                 `🔍 **Word:** ${word}\n` +
                 `📖 **Definition:** Something awesome or exciting\n` +
                 `💬 **Example:** "That party was lit!"\n\n` +
                 `_Urban Dictionary API integration required_`,
        parseMode: 'html'
      });

      return { success: true, message: 'Urban dictionary lookup', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Urban dictionary failed:', error);
      return { success: false, error: 'Lookup failed', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  async handleWikipedia(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message, args } = ctx;
    
    try {
      if (args.length === 0) {
        await message.reply({
          message: '❌ **Usage:** `.wikipedia <query>`\nExample: `.wikipedia Albert Einstein`',
          parseMode: 'html'
        });
        return { success: false, error: 'No query', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      const query = args.join(' ');
      
      await message.reply({
        message: `🌐 **Wikipedia**\n\n` +
                 `🔍 **Query:** ${query}\n` +
                 `📄 **Summary:** ${query} was a notable figure/thing with significant impact...\n\n` +
                 `_Wikipedia API integration required_`,
        parseMode: 'html'
      });

      return { success: true, message: 'Wikipedia search', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Wikipedia search failed:', error);
      return { success: false, error: 'Search failed', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  // ==================== GAME FEATURES ====================
  async handleQuiz(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message } = ctx;
    
    try {
      const questions = [
        {
          question: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          answer: 2
        },
        {
          question: "Which planet is known as the Red Planet?",
          options: ["Venus", "Mars", "Jupiter", "Saturn"],
          answer: 1
        }
      ];

      const randomQ = questions[Math.floor(Math.random() * questions.length)];
      const optionsText = randomQ.options.map((opt, idx) => `${idx + 1}. ${opt}`).join('\n');
      
      await message.reply({
        message: `🧠 **Quiz Time!**\n\n` +
                 `❓ **Question:** ${randomQ.question}\n\n` +
                 `${optionsText}\n\n` +
                 `💡 Reply with the number (1-4) of your answer!`,
        parseMode: 'html'
      });

      return { success: true, message: 'Quiz started', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Quiz failed:', error);
      return { success: false, error: 'Quiz failed', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  async handleLoveCalculator(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message, args } = ctx;
    
    try {
      let name1 = message.sender?.firstName || "You";
      let name2 = "Someone";
      
      if (args.length > 0) {
        name2 = args.join(' ');
      } else if (message.replyToMsgId) {
        const repliedUser = await (await message.getReplyMessage()).getSender();
        name2 = repliedUser?.firstName || "Them";
      }

      const lovePercent = Math.floor(Math.random() * 100) + 1;
      let compatibility = "💔 Not great";
      
      if (lovePercent > 80) compatibility = "💖 Perfect match!";
      else if (lovePercent > 60) compatibility = "💕 Great compatibility";
      else if (lovePercent > 40) compatibility = "💝 Good potential";
      else if (lovePercent > 20) compatibility = "❤️ Could work";

      await message.reply({
        message: `💑 **Love Calculator**\n\n` +
                 `👤 **${name1}** + **${name2}**\n` +
                 `💖 **Love Score:** ${lovePercent}%\n` +
                 `📊 **Compatibility:** ${compatibility}\n\n` +
                 `_Just for fun! Don't take it seriously 😊_`,
        parseMode: 'html'
      });

      return { success: true, message: 'Love calculated', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId, data: { lovePercent } };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Love calculator failed:', error);
      return { success: false, error: 'Calculation failed', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  // ==================== REMINDER FEATURES ====================
  async handleReminder(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message, args } = ctx;
    
    try {
      if (args.length < 2) {
        await message.reply({
          message: '❌ **Usage:** `.reminder <time> <message>`\nExample: `.reminder 30m Buy milk`\nTime formats: 5m, 1h, 2d',
          parseMode: 'html'
        });
        return { success: false, error: 'Invalid args', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      const timeStr = args[0];
      const reminderMsg = args.slice(1).join(' ');
      
      let minutes = 0;
      if (timeStr.endsWith('m')) minutes = parseInt(timeStr);
      else if (timeStr.endsWith('h')) minutes = parseInt(timeStr) * 60;
      else if (timeStr.endsWith('d')) minutes = parseInt(timeStr) * 1440;
      else minutes = parseInt(timeStr);

      if (isNaN(minutes) || minutes <= 0) {
        await message.reply({ message: '❌ **Invalid time format**', parseMode: 'html' });
        return { success: false, error: 'Invalid time', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      const reminderTime = new Date(Date.now() + minutes * 60000);
      const reminderId = Helpers.randomString(8);
      
      this.reminders.set(reminderId, {
        userId: message.senderId,
        time: reminderTime,
        message: reminderMsg
      });

      await message.reply({
        message: `⏰ **Reminder Set!**\n\n` +
                 `📝 **Message:** ${reminderMsg}\n` +
                 `⏱️ **Time:** ${minutes} minutes from now\n` +
                 `🕐 **Will remind at:** ${reminderTime.toLocaleTimeString()}`,
        parseMode: 'html'
      });

      logger.info(`Reminder set: ${reminderMsg} in ${minutes}min`);
      return { success: true, message: 'Reminder set', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Reminder failed:', error);
      return { success: false, error: 'Failed to set reminder', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  // ==================== STATS FEATURES ====================
  async handleStats(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message } = ctx;
    
    try {
      const userId = message.senderId;
      const userStat = this.userStats.get(userId) || { messages: 0, lastSeen: new Date() };
      
      await message.reply({
        message: `📊 **Your Statistics**\n\n` +
                 `👤 **User:** ${message.sender?.firstName}\n` +
                 `💬 **Messages Sent:** ${userStat.messages}\n` +
                 `👀 **Last Active:** ${userStat.lastSeen.toLocaleDateString()}\n` +
                 `🆔 **User ID:** ${userId}\n\n` +
                 `_Statistics are session-based_`,
        parseMode: 'html'
      });

      return { success: true, message: 'Stats sent', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Stats command failed:', error);
      return { success: false, error: 'Failed to get stats', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  async handleQuote(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message } = ctx;
    
    try {
      const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
      
      await message.reply({
        message: `💫 **Inspirational Quote**\n\n"${randomQuote}"`,
        parseMode: 'html'
      });

      return { success: true, message: 'Quote sent', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Quote command failed:', error);
      return { success: false, error: 'Failed to get quote', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  // ==================== ADMIN FEATURES ====================
  async handleBroadcast(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message, args } = ctx;
    
    try {
      // Only allow specific users (add your user ID)
      const allowedUsers: bigint[] = []; // FIXED: big64 → bigint
      
      if (allowedUsers.length > 0 && !allowedUsers.includes(message.senderId)) {
        await message.reply({ message: '⛔ **Access Denied**', parseMode: 'html' });
        return { success: false, error: 'Not allowed', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      if (args.length === 0) {
        await message.reply({ message: '❌ **Usage:** `.broadcast <message>`', parseMode: 'html' });
        return { success: false, error: 'No message', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      const broadcastMsg = args.join(' ');
      
      await message.reply({
        message: `📢 **Broadcast Feature**\n\n` +
                 `This would send to all chats. Demo mode:\n` +
                 `**Message:** ${broadcastMsg}`,
        parseMode: 'html'
      });

      logger.info(`Broadcast demo: ${Helpers.truncateText(broadcastMsg, 50)}`);
      return { success: true, message: 'Broadcast demo', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Broadcast failed:', error);
      return { success: false, error: 'Broadcast failed', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  // ==================== HELPER METHODS ====================
  private startReminderChecker(): void {
    setInterval(() => {
      this.checkReminders();
    }, 30000); // Check every 30 seconds
  }

  private async checkReminders(): Promise<void> {
    const now = new Date();
    
    for (const [id, reminder] of this.reminders.entries()) {
      if (reminder.time <= now) {
        try {
          await this.client.sendMessage(reminder.userId, {
            message: `⏰ **Reminder!**\n\n${reminder.message}`
          });
          this.reminders.delete(id);
          logger.info(`Reminder sent: ${Helpers.truncateText(reminder.message, 30)}`);
        } catch (error) {
          logger.error('Failed to send reminder:', error);
        }
      }
    }
  }

  // Track user activity
  public trackUserActivity(userId: bigint): void { // FIXED: big64 → bigint
    const currentStat = this.userStats.get(userId) || { messages: 0, lastSeen: new Date() };
    this.userStats.set(userId, {
      messages: currentStat.messages + 1,
      lastSeen: new Date()
    });
  }
}
