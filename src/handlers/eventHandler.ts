import { Api } from 'telegram';
import type { TelegramClient } from 'telegram';
import type { NewMessageEvent, EditedMessageEvent } from 'telegram/events';
import { logger } from '../utils/logger.js';
import { Helpers } from '../utils/helpers.js';
import { CommandHandler } from './commandHandler.js';
import { FeatureHandler } from './featureHandler.js'; // NEW IMPORT
import type { CommandContext } from '../types/index.js';

export class EventHandler {
  private client: TelegramClient;
  private commandHandler: CommandHandler;
  private featureHandler: FeatureHandler; // NEW

  constructor(client: TelegramClient) {
    this.client = client;
    this.commandHandler = new CommandHandler(client);
    this.featureHandler = new FeatureHandler(client); // NEW
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

    // Check for spam (NEW FEATURE)
    if (this.featureHandler.containsSpam(text)) {
      logger.security(`Spam detected from ${sender?.firstName}: ${Helpers.truncateText(text, 30)}`);
      // You can add auto-delete or warn user here
    }

    // Auto-reply system (NEW FEATURE)
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

      // NEW COMMANDS - Using FeatureHandler
      switch (command) {
        // Media/File Commands
        case 'caption':
          result = await this.featureHandler.handleCaption(ctx);
          break;
        case 'rename':
          result = await this.featureHandler.handleRename(ctx);
          break;

        // Group Management
        case 'ban':
          result = await this.featureHandler.handleBan(ctx);
          break;
        case 'members':
          result = await this.featureHandler.handleMembers(ctx);
          break;

        // Utility Commands
        case 'weather':
          result = await this.featureHandler.handleWeather(ctx);
          break;
        case 'calc':
          result = await this.featureHandler.handleCalc(ctx);
          break;

        // Fun Commands
        case 'dice':
          result = await this.featureHandler.handleDice(ctx);
          break;
        case 'joke':
          result = await this.featureHandler.handleJoke(ctx);
          break;

        // Automation
        case 'autoreply':
          result = await this.featureHandler.handleAutoReply(ctx);
          break;
        case 'addar':
          result = await this.featureHandler.handleAddAutoReply(ctx);
          break;

        // Security
        case 'antispam':
          result = await this.featureHandler.handleAntiSpam(ctx);
          break;
        case 'addfilter':
          result = await this.featureHandler.handleAddFilter(ctx);
          break;

        // Original commands (using existing CommandHandler)
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
        case 'broadcast':
          result = await this.commandHandler.handleBroadcast(message, args);
          break;

        default:
          result = await this.commandHandler.handleUnknown(message, command);
      }

      this.logCommandResult(command, result);

    } catch (error) {
      logger.error(`Command execution error (${command}):`, error);
      await message.reply({
        message: '❌ **Command Error**\nPlease try again later.',
        parseMode: 'html'
      });
    }
  }

  // ... rest of the existing eventHandler code remains same
  private logCommandResult(command: string, result: any): void {
    if (result?.success) {
      logger.success(`Command .${command} executed in ${result.executionTime}ms`);
    } else {
      logger.error(`Command .${command} failed: ${result?.error}`);
    }
  }

  async handleEditedMessage(event: EditedMessageEvent): Promise<void> {
    // ... existing code
  }

  async handleUserJoined(event: any): Promise<void> {
    // ... existing code
  }

  async handleUserLeft(event: any): Promise<void> {
    // ... existing code
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
