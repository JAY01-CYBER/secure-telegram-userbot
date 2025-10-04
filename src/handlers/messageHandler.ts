import { Api } from 'telegram';
import type { NewMessageEvent } from 'telegram/events';
import { logger } from '../utils/logger.js';

export async function messageHandler(event: NewMessageEvent) {
  const message = event.message;
  const client = event.client;

  // Ignore own messages and non-text
  if (!message.text || message.out) return;

  const text = message.text.trim();
  const sender = await message.getSender();
  const senderName = sender && 'firstName' in sender ? sender.firstName : 'Unknown'; // FIXED: Type-safe firstName access
  
  // Secure logging
  logger.message(`Message from ${senderName}: ${text.substring(0, 50)}...`);

  // Command handling
  if (text.startsWith('.')) {
    await handleCommand(text, message, client, sender);
  }
}

async function handleCommand(
  text: string, 
  message: any, 
  client: any, 
  sender: any
) {
  const command = text.slice(1).toLowerCase().split(' ')[0];
  const args = text.slice(1).split(' ').slice(1);

  try {
    switch (command) {
      case 'ping':
        await message.reply({
          message: '🏓 **Pong!**\n⚡ Node.js + TypeScript',
          parseMode: 'html'
        });
        break;

      case 'status':
        const me = await client.getMe();
        const meName = me && 'firstName' in me ? me.firstName : 'User'; // FIXED: Type-safe firstName access
        const uptime = process.uptime();
        await message.reply({
          message: `🤖 **Userbot Status**\n\n` +
                   `✅ **Online:** Yes\n` +
                   `👤 **User:** ${meName}\n` +
                   `⏰ **Uptime:** ${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s\n` +
                   `🛡️ **Security:** Enabled`,
          parseMode: 'html'
        });
        break;

      case 'echo':
        if (args.length > 0) {
          await message.reply({
            message: `📢 ${args.join(' ')}`,
            parseMode: 'html'
          });
        } else {
          await message.reply({
            message: '❌ Usage: `.echo <message>`',
            parseMode: 'html'
          });
        }
        break;

      case 'help':
        await message.reply({
          message: `📖 **Available Commands**\n\n` +
                   `.ping - Test response\n` +
                   `.status - Bot status\n` +
                   `.echo <text> - Echo message\n` +
                   `.help - Show this help\n\n` +
                   `🔒 _Secure Userbot v2.0_`,
          parseMode: 'html'
        });
        break;

      default:
        await message.reply({
          message: '❓ Unknown command. Use `.help` for available commands.',
          parseMode: 'html'
        });
    }
  } catch (error) {
    logger.error('Command execution error:', error);
    await message.reply({
      message: '❌ Command failed. Please try again.',
      parseMode: 'html'
    });
  }
}
