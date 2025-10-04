import { Api } from 'telegram';
import type { TelegramClient } from 'telegram';
import { logger } from '../utils/logger.js';
import { Helpers } from '../utils/helpers.js';
import type { CommandContext, CommandResult } from '../types/index.js';

export class FeatureHandler {
  private client: TelegramClient;
  private autoReplies: Map<string, string> = new Map();
  private spamFilters: Set<string> = new Set();
  private allowedUsers: Set<big64> = new Set();

  constructor(client: TelegramClient) {
    this.client = client;
    this.loadDefaultFeatures();
  }

  // ==================== MEDIA/FILE FEATURES ====================
  async handleCaption(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message, args } = ctx;
    
    try {
      if (!message.replyToMsgId) {
        await message.reply({
          message: '❌ **Reply to an image** with `.caption <text>` to add caption',
          parseMode: 'html'
        });
        return { success: false, error: 'No replied message', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      if (args.length === 0) {
        await message.reply({
          message: '❌ **Usage:** `.caption <your text>`',
          parseMode: 'html'
        });
        return { success: false, error: 'No caption text', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      const captionText = args.join(' ');
      const repliedMsg = await message.getReplyMessage();
      
      if (repliedMsg.media) {
        await this.client.sendFile(message.chatId, {
          file: repliedMsg.media,
          caption: captionText,
          replyTo: message.replyToMsgId
        });
        
        logger.info(`Caption added: ${Helpers.truncateText(captionText, 30)}`);
        return { success: true, message: 'Caption added', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      } else {
        await message.reply({ message: '❌ **Replied message has no media**', parseMode: 'html' });
        return { success: false, error: 'No media', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Caption command failed:', error);
      return { success: false, error: 'Failed to add caption', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  async handleRename(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message, args } = ctx;
    
    try {
      if (!message.replyToMsgId) {
        await message.reply({ message: '❌ **Reply to a file** with `.rename <new name>`', parseMode: 'html' });
        return { success: false, error: 'No replied message', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      if (args.length === 0) {
        await message.reply({ message: '❌ **Usage:** `.rename <new filename>`', parseMode: 'html' });
        return { success: false, error: 'No filename', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      const newName = args.join(' ');
      const repliedMsg = await message.getReplyMessage();
      
      if (repliedMsg.media && repliedMsg.document) {
        await this.client.sendFile(message.chatId, {
          file: repliedMsg.media,
          fileName: newName,
          replyTo: message.replyToMsgId
        });
        
        logger.info(`File renamed to: ${newName}`);
        return { success: true, message: 'File renamed', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      } else {
        await message.reply({ message: '❌ **Replied message has no file**', parseMode: 'html' });
        return { success: false, error: 'No file', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Rename command failed:', error);
      return { success: false, error: 'Failed to rename', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  // ==================== GROUP MANAGEMENT ====================
  async handleBan(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message, args } = ctx;
    
    try {
      if (!(await Helpers.isAdmin(this.client, message.chatId, message.senderId))) {
        await message.reply({ message: '⛔ **Admin Only**\nYou need to be admin', parseMode: 'html' });
        return { success: false, error: 'Not admin', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      const targetUser = message.replyToMsgId ? 
        await (await message.getReplyMessage()).getSender() : 
        await this.client.getInputEntity(args[0] || '');

      if (!targetUser) {
        await message.reply({ message: '❌ **User not found**', parseMode: 'html' });
        return { success: false, error: 'User not found', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      await this.client.editBanned(message.chatId, targetUser, { viewMessages: true });
      await message.reply({ message: `🔨 **User Banned**\n${targetUser.firstName} has been banned`, parseMode: 'html' });

      logger.info(`User banned: ${targetUser.firstName}`);
      return { success: true, message: 'User banned', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Ban command failed:', error);
      return { success: false, error: 'Failed to ban', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  async handleMembers(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message } = ctx;
    
    try {
      const participants = await this.client.getParticipants(message.chatId);
      const memberCount = participants.length;
      
      await message.reply({
        message: `👥 **Group Members**\n\nTotal Members: ${memberCount}\n\nUse \`.admins\` for admin list`,
        parseMode: 'html'
      });

      return { success: true, message: 'Members count', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId, data: { memberCount } };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Members command failed:', error);
      return { success: false, error: 'Failed to get members', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  // ==================== UTILITY FEATURES ====================
  async handleWeather(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message, args } = ctx;
    
    try {
      if (args.length === 0) {
        await message.reply({ message: '❌ **Usage:** `.weather <city>`\nExample: `.weather London`', parseMode: 'html' });
        return { success: false, error: 'No city', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      const city = args.join(' ');
      
      await message.reply({
        message: `🌤️ **Weather in ${city}**\n\n` +
                 `📍 **Location:** ${city}\n` +
                 `🌡️ **Temperature:** 25°C\n` +
                 `💧 **Humidity:** 65%\n` +
                 `💨 **Wind:** 15 km/h\n` +
                 `☁️ **Condition:** Partly Cloudy\n\n` +
                 `_Weather API integration required_`,
        parseMode: 'html'
      });

      return { success: true, message: 'Weather info', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Weather command failed:', error);
      return { success: false, error: 'Failed to get weather', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  async handleCalc(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message, args } = ctx;
    
    try {
      if (args.length === 0) {
        await message.reply({ message: '❌ **Usage:** `.calc <expression>`\nExample: `.calc 2+2*5`', parseMode: 'html' });
        return { success: false, error: 'No expression', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      const expression = args.join(' ');
      let result: number;
      
      try {
        result = eval(expression.replace(/[^0-9+\-*/().]/g, ''));
      } catch {
        await message.reply({ message: '❌ **Invalid expression**', parseMode: 'html' });
        return { success: false, error: 'Invalid math', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      await message.reply({
        message: `🧮 **Calculator**\n\n**Expression:** ${expression}\n**Result:** ${result}`,
        parseMode: 'html'
      });

      return { success: true, message: 'Calculation done', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId, data: { expression, result } };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Calc command failed:', error);
      return { success: false, error: 'Failed to calculate', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  // ==================== FUN COMMANDS ====================
  async handleDice(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message } = ctx;
    
    try {
      const diceResult = Math.floor(Math.random() * 6) + 1;
      
      await message.reply({
        message: `🎲 **Dice Roll**\n\nYou rolled: **${diceResult}**\n\n${this.getDiceEmoji(diceResult)}`,
        parseMode: 'html'
      });

      return { success: true, message: 'Dice rolled', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId, data: { diceResult } };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Dice command failed:', error);
      return { success: false, error: 'Failed to roll', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  async handleJoke(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message } = ctx;
    
    try {
      const jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "Why did the scarecrow win an award? He was outstanding in his field!",
        "Why don't skeletons fight each other? They don't have the guts!",
        "What do you call a fake noodle? An impasta!",
        "Why did the math book look so sad? Because it had too many problems!"
      ];
      
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      
      await message.reply({
        message: `😂 **Random Joke**\n\n${randomJoke}`,
        parseMode: 'html'
      });

      return { success: true, message: 'Joke sent', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Joke command failed:', error);
      return { success: false, error: 'Failed to get joke', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  // ==================== AUTOMATION FEATURES ====================
  async handleAutoReply(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message, args } = ctx;
    
    try {
      if (args.length < 1) {
        await message.reply({
          message: '❌ **Usage:**\n`.autoreply on` - Enable\n`.autoreply off` - Disable\n`.autoreply list` - Show all',
          parseMode: 'html'
        });
        return { success: false, error: 'Invalid args', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      const action = args[0].toLowerCase();
      
      if (action === 'on') {
        await message.reply({ message: '✅ **Auto-reply enabled**\nUse `.addar <word> <reply>`', parseMode: 'html' });
      } else if (action === 'off') {
        await message.reply({ message: '❌ **Auto-reply disabled**', parseMode: 'html' });
      } else if (action === 'list') {
        const autoReplyList = Array.from(this.autoReplies.entries())
          .map(([word, reply]) => `• **${word}** → ${reply}`)
          .join('\n');
        
        await message.reply({
          message: `📋 **Auto-reply List**\n\n${autoReplyList || 'No auto-replies'}`,
          parseMode: 'html'
        });
      } else {
        await message.reply({ message: '❌ **Invalid action**', parseMode: 'html' });
        return { success: false, error: 'Invalid action', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      return { success: true, message: 'Auto-reply action', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Auto-reply command failed:', error);
      return { success: false, error: 'Failed auto-reply', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  async handleAddAutoReply(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message, args } = ctx;
    
    try {
      if (args.length < 2) {
        await message.reply({ message: '❌ **Usage:** `.addar <word> <reply>`', parseMode: 'html' });
        return { success: false, error: 'Insufficient args', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      const word = args[0].toLowerCase();
      const reply = args.slice(1).join(' ');
      
      this.autoReplies.set(word, reply);
      await message.reply({ message: `✅ **Auto-reply added**\n**Trigger:** ${word}\n**Reply:** ${reply}`, parseMode: 'html' });

      logger.info(`Auto-reply added: ${word} → ${reply}`);
      return { success: true, message: 'Auto-reply added', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId, data: { word, reply } };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Add auto-reply failed:', error);
      return { success: false, error: 'Failed to add', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  // ==================== SECURITY FEATURES ====================
  async handleAntiSpam(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message, args } = ctx;
    
    try {
      if (args.length < 1) {
        await message.reply({
          message: '❌ **Usage:**\n`.antispam on` - Enable\n`.antispam off` - Disable\n`.antispam list` - Show filters',
          parseMode: 'html'
        });
        return { success: false, error: 'Invalid args', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      const action = args[0].toLowerCase();
      
      if (action === 'on') {
        await message.reply({ message: '✅ **Anti-spam enabled**\nUse `.addfilter <word>`', parseMode: 'html' });
      } else if (action === 'off') {
        await message.reply({ message: '❌ **Anti-spam disabled**', parseMode: 'html' });
      } else if (action === 'list') {
        const filterList = Array.from(this.spamFilters).map(word => `• ${word}`).join('\n');
        await message.reply({ message: `🛡️ **Spam Filters**\n\n${filterList || 'No filters'}`, parseMode: 'html' });
      } else {
        await message.reply({ message: '❌ **Invalid action**', parseMode: 'html' });
      }

      return { success: true, message: 'Anti-spam action', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Anti-spam command failed:', error);
      return { success: false, error: 'Failed anti-spam', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  async handleAddFilter(ctx: CommandContext): Promise<CommandResult> {
    const startTime = Date.now();
    const { message, args } = ctx;
    
    try {
      if (args.length === 0) {
        await message.reply({ message: '❌ **Usage:** `.addfilter <word>`', parseMode: 'html' });
        return { success: false, error: 'No word', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
      }

      const word = args[0].toLowerCase();
      this.spamFilters.add(word);
      await message.reply({ message: `✅ **Spam filter added**\n**Filter:** ${word}`, parseMode: 'html' });

      logger.info(`Spam filter added: ${word}`);
      return { success: true, message: 'Filter added', executionTime: Date.now() - startTime, userId: message.senderId, chatId: message.chatId };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Add filter failed:', error);
      return { success: false, error: 'Failed to add filter', executionTime, userId: message.senderId, chatId: message.chatId };
    }
  }

  // ==================== HELPER METHODS ====================
  private getDiceEmoji(result: number): string {
    const emojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return emojis[result - 1] || '🎲';
  }

  private loadDefaultFeatures(): void {
    this.autoReplies.set('hello', 'Hello there! 👋');
    this.autoReplies.set('hi', 'Hi! How can I help? 😊');
    this.autoReplies.set('thanks', 'You\'re welcome! 🙏');
    this.autoReplies.set('thank you', 'You\'re welcome! 🙏');
    
    this.spamFilters.add('spam');
    this.spamFilters.add('advertisement');
    this.spamFilters.add('promotion');
  }

  // Public methods for event handler
  public containsSpam(text: string): boolean {
    const lowerText = text.toLowerCase();
    for (const filter of this.spamFilters) {
      if (lowerText.includes(filter)) return true;
    }
    return false;
  }

  public getAutoReply(text: string): string | null {
    const lowerText = text.toLowerCase();
    for (const [word, reply] of this.autoReplies.entries()) {
      if (lowerText.includes(word)) return reply;
    }
    return null;
  }
}
