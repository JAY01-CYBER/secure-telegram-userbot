import { Api } from 'telegram';
import type { TelegramClient } from 'telegram';
import type { NewMessageEvent, EditedMessageEvent } from 'telegram/events';
import { logger } from '../utils/logger.js';
import { CommandHandler } from './commandHandler.js';

export class EventHandler {
  private client: TelegramClient;
  private commandHandler: CommandHandler;

  constructor(client: TelegramClient) {
    this.client = client;
    this.commandHandler = new CommandHandler(client);
  }

  // Handle new messages
  async handleNewMessage(event: NewMessageEvent): Promise<void> {
    const message = event.message;
    
    // Ignore if no text or message is from ourselves
    if (!message.text || message.out) return;

    const text = message.text.trim();
    const sender = await message.getSender();
    const chat = await message.getChat();

    // Secure logging (no sensitive info)
    const chatType = chat instanceof Api.Chat ? 'Group' : 'Private';
    logger.message(`${chatType} message from ${sender?.firstName}: ${text.substring(0, 30)}...`);

    // Handle commands (messages starting with .)
    if (text.startsWith('.')) {
      await this.handleCommand(text, message, sender);
    }

    // You can add more event handlers here:
    // - Handle mentions
    // - Handle specific keywords
    // - Auto-reply features
    // etc.
  }

  // Handle edited messages
  async handleEditedMessage(event: EditedMessageEvent): Promise<void> {
    const message = event.message;
    
    if (!message.text || message.out) return;

    const text = message.text.trim();
    const sender = await message.getSender();

    logger.message(`Edited message from ${sender?.firstName}: ${text.substring(0, 30)}...`);

    // Optional: Handle edited commands
    if (text.startsWith('.')) {
      await message.reply({
        message: '✏️ **Message Edited**\n\nI see you edited your command!',
        parseMode: 'html'
      });
    }
  }

  // Handle command parsing and execution
  private async handleCommand(text: string, message: any, sender: any): Promise<void> {
    const command = text.slice(1).toLowerCase().split(' ')[0];
    const args = text.slice(1).split(' ').slice(1);

    try {
      switch (command) {
        case 'ping':
          await this.commandHandler.handlePing(message);
          break;

        case 'status':
          await this.commandHandler.handleStatus(message);
          break;

        case 'speed':
          await this.commandHandler.handleSpeed(message);
          break;

        case 'echo':
          await this.commandHandler.handleEcho(message, args);
          break;

        case 'help':
          await this.commandHandler.handleHelp(message);
          break;

        case 'restart':
          await this.commandHandler.handleRestart(message);
          break;

        case 'broadcast':
          await this.commandHandler.handleBroadcast(message, args);
          break;

        default:
          await this.commandHandler.handleUnknown(message);
      }
    } catch (error) {
      logger.error(`Command execution error (${command}):`, error);
      
      await message.reply({
        message: '❌ **Command Error**\n\n' +
                 'An error occurred while executing the command. ' +
                 'Please try again later.',
        parseMode: 'html'
      });
    }
  }

  // Handle user joined chat
  async handleUserJoined(event: any): Promise<void> {
    // This is just an example - you can implement welcome messages
    logger.info('User joined chat event');
  }

  // Handle user left chat
  async handleUserLeft(event: any): Promise<void> {
    // This is just an example
    logger.info('User left chat event');
  }

  // Get all event handlers for registration
  getHandlers() {
    return {
      newMessage: this.handleNewMessage.bind(this),
      editedMessage: this.handleEditedMessage.bind(this),
      userJoined: this.handleUserJoined.bind(this),
      userLeft: this.handleUserLeft.bind(this)
    };
  }
}
