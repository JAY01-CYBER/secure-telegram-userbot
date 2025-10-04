import { Api } from 'telegram';
import type { TelegramClient } from 'telegram';
import type { NewMessageEvent, EditedMessageEvent } from 'telegram/events';
import { logger } from '../utils/logger.js';
import { Helpers } from '../utils/helpers.js';
import { CommandHandler } from './commandHandler.js';
import { FeatureHandler } from './featureHandler.js'; // NEW IMPORT
import { AdvancedFeatures } from './advancedFeatures.js'; // NEW IMPORT
import type { CommandContext } from '../types/index.js';

export class EventHandler {
  private client: TelegramClient;
  private commandHandler: CommandHandler;
  private featureHandler: FeatureHandler; // NEW
  private advancedHandler: AdvancedFeatures; // NEW

  constructor(client: TelegramClient) {
    this.client = client;
    this.commandHandler = new CommandHandler(client);
    this.featureHandler = new FeatureHandler(client); // NEW
    this.advancedHandler = new AdvancedFeatures(client); // NEW
  }

  async handleNewMessage(event: NewMessageEvent): Promise<void> {
    const message = event.message;
    
    if (!message.text || message.out) return;

    const text = message.text.trim();
    const sender = await message.getSender();
    const chat = await message.getChat();

    // Secure logging
    const chatType = chat instanceof Api.Chat ? 'Group' : 'Private';
    logger.message(`${chatType} message from ${sender?.firstName}: ${Helpers.truncateText(text, 30)}`);

    // NEW: Track user activity
    this.advancedHandler.trackUserActivity(message.senderId);

    // NEW: Check for spam
    if (this.featureHandler.containsSpam(text)) {
      logger.security(`Spam detected from ${sender?.firstName}: ${Helpers.truncateText(text, 30)}`);
      // You can add auto-delete or warn user here
    }

    // NEW: Auto-reply system
    const autoReply = this.featureHandler.getAutoReply(text);
    if (autoReply && !text.startsWith('.')) {
      try {
        await message.reply({ message: autoReply, parseMode: 'html' });
        logger.info(`Auto-reply sent for: ${Helpers.truncateText(text, 20)}`);
      } catch (error) {
        logger.error('Failed to send auto-reply:', error);
      }
    }

    // Handle commands
    if (text.startsWith('.')) {
      await this.handleCommand(text, message, sender, chat);
    }
  }

  private async handleCommand(text: string, message: any, sender: any, chat: any): Promise<void> {
    const { command, args } = Helpers.parseArgs(text);
    
    const ctx: CommandContext = {
      client: this.client,
      message,
      sender,
      chat,
      args,
      command
    };

    try {
      let result;

      // NEW COMMANDS - Using FeatureHandler and AdvancedFeatures
      switch (command) {
        // ==================== FEATURE HANDLER COMMANDS ====================
        case 'caption':
          result = await this.featureHandler.handleCaption(ctx);
          break;
        case 'rename':
          result = await this.featureHandler.handleRename(ctx);
          break;
        case 'ban':
          result = await this.featureHandler.handleBan(ctx);
          break;
        case 'members':
          result = await this.featureHandler.handleMembers(ctx);
          break;
        case 'weather':
          result = await this.featureHandler.handleWeather(ctx);
          break;
        case 'calc':
          result = await this.featureHandler.handleCalc(ctx);
          break;
        case 'dice':
          result = await this.featureHandler.handleDice(ctx);
          break;
        case 'joke':
          result = await this.featureHandler.handleJoke(ctx);
          break;
        case 'autoreply':
          result = await this.featureHandler.handleAutoReply(ctx);
          break;
        case 'addar':
          result = await this.featureHandler.handleAddAutoReply(ctx);
          break;
        case 'antispam':
          result = await this.featureHandler.handleAntiSpam(ctx);
          break;
        case 'addfilter':
          result = await this.featureHandler.handleAddFilter(ctx);
          break;

        // ==================== ADVANCED FEATURES COMMANDS ====================
        case 'ytdl':
          result = await this.advancedHandler.handleYouTubeDownload(ctx);
          break;
        case 'ud':
          result = await this.advancedHandler.handleUrbanDictionary(ctx);
          break;
        case 'wikipedia':
          result = await this.advancedHandler.handleWikipedia(ctx);
          break;
        case 'quiz':
          result = await this.advancedHandler.handleQuiz(ctx);
          break;
        case 'love':
          result = await this.advancedHandler.handleLoveCalculator(ctx);
          break;
        case 'reminder':
          result = await this.advancedHandler.handleReminder(ctx);
          break;
        case 'stats':
          result = await this.advancedHandler.handleStats(ctx);
          break;
        case 'quote':
          result = await this.advancedHandler.handleQuote(ctx);
          break;
        case 'broadcast':
          result = await this.advancedHandler.handleBroadcast(ctx);
          break;

        // ==================== ORIGINAL COMMAND HANDLER COMMANDS ====================
        case 'ping':
          result = await this.commandHandler.handlePing(message);
          break;
        case 'status':
          result = await this.commandHandler.handleStatus(message);
          break;
        case 'speed':
          result = await this.commandHandler.handleSpeed(message);
          break;
        case 'echo':
          result = await this.commandHandler.handleEcho(message, args);
          break;
        case 'help':
          result = await this.commandHandler.handleHelp(message);
          break;
        case 'restart':
          result = await this.commandHandler.handleRestart(message);
          break;

        default:
          result = await this.commandHandler.handleUnknown(message, command);
      }

      this.logCommandResult(command, result);

    } catch (error) {
      logger.error(`Command execution error (${command}):`, error);
      
      try {
        await message.reply({
          message: '❌ **Command Error**\n\nAn unexpected error occurred. Please try again later.',
          parseMode: 'html'
        });
      } catch (replyError) {
        logger.error('Failed to send error message:', replyError);
      }
    }
  }

  private logCommandResult(command: string, result: any): void {
    if (result?.success) {
      logger.success(`Command .${command} executed successfully in ${result.executionTime}ms`);
    } else {
      logger.error(`Command .${command} failed: ${result?.error}`);
    }
  }

  // ... REST OF THE EXISTING CODE REMAINS SAME ...
  async handleEditedMessage(event: EditedMessageEvent): Promise<void> {
    const message = event.message;
    
    if (!message.text || message.out) return;

    const text = message.text.trim();
    const sender = await message.getSender();

    logger.message(`Edited message from ${sender?.firstName}: ${Helpers.truncateText(text, 30)}`);

    // Optional: Handle edited commands
    if (text.startsWith('.')) {
      try {
        await message.reply({
          message: '✏️ **Message Edited**\n\nI see you edited your command! Use `.help` for available commands.',
          parseMode: 'html'
        });
      } catch (error) {
        logger.error('Failed to handle edited message:', error);
      }
    }
  }

  async handleUserJoined(event: any): Promise<void> {
    try {
      const user = await event.getUser();
      const chat = await event.getChat();
      
      logger.info(`User ${user.firstName} joined chat: ${chat.title}`);
      
      // Optional: Send welcome message
      if (chat instanceof Api.Chat) {
        await this.client.sendMessage(chat.id, {
          message: `👋 Welcome ${user.firstName} to the group!`
        });
      }
    } catch (error) {
      logger.error('Failed to handle user join event:', error);
    }
  }

  async handleUserLeft(event: any): Promise<void> {
    try {
      const user = await event.getUser();
      const chat = await event.getChat();
      
      logger.info(`User ${user.firstName} left chat: ${chat.title}`);
    } catch (error) {
      logger.error('Failed to handle user left event:', error);
    }
  }

  getHandlers() {
    return {
      newMessage: this.handleNewMessage.bind(this),
      editedMessage: this.handleEditedMessage.bind(this),
      userJoined: this.handleUserJoined.bind(this),
      userLeft: this.handleUserLeft.bind(this)
    };
  }
}
