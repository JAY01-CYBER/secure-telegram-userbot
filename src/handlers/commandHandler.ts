import { TelegramClient } from 'telegram';
import { logger } from '../utils/logger.js';
import { Helpers } from '../utils/helpers.js';
import type { CommandResult } from '../types/index.js';

export class CommandHandler {
    private client: TelegramClient;

    constructor(client: TelegramClient) {
        this.client = client;
    }

    async handlePing(message: any): Promise<CommandResult> {
        const startTime = Date.now();
        try {
            await message.reply({
                message: '🏓 **Pong!**\n⚡ Node.js + TypeScript',
                parseMode: 'html'
            });

            const executionTime = Date.now() - startTime;
            return {
                success: true,
                message: 'Ping command executed',
                executionTime,
                userId: message.senderId,
                chatId: message.chatId
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                success: false,
                error: 'Ping command failed',
                executionTime,
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
            const memory = process.memoryUsage();
            
            const statusMessage = `🤖 **Bot Status**\n\n` +
                `✅ **Online:** Yes\n` +
                `👤 **User:** ${me.firstName}\n` +
                `⏰ **Uptime:** ${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s\n` +
                `💾 **Memory:** ${Math.round(memory.heapUsed / 1024 / 1024)}MB\n` +
                `🛡️ **Security:** Enabled`;

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
                message: '⚡ Testing speed...'
            });
            
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            let performance = 'Excellent 🚀';
            if (responseTime > 1000) performance = 'Good 👍';
            if (responseTime > 3000) performance = 'Slow 🐢';
            
            const speedMessage = `**Speed Test Results**\n\n` +
                `**Response Time:** ${responseTime}ms\n` +
                `**Performance:** ${performance}\n` +
                `**Test Time:** ${new Date().toLocaleTimeString()}`;

            await this.client.editMessage(tempMsg.chatId, {
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

    async handleEcho(message: any, args: string[]): Promise<CommandResult> {
        const startTime = Date.now();
        try {
            if (args.length === 0) {
                await message.reply({
                    message: '❌ Usage: `.echo <message>`',
                    parseMode: 'html'
                });
                return {
                    success: false,
                    error: 'No message provided',
                    executionTime: Date.now() - startTime,
                    userId: message.senderId,
                    chatId: message.chatId
                };
            }

            const echoText = args.join(' ');
            await message.reply({
                message: `📢 ${echoText}`,
                parseMode: 'html'
            });

            const executionTime = Date.now() - startTime;
            return {
                success: true,
                message: 'Echo command executed',
                executionTime,
                userId: message.senderId,
                chatId: message.chatId
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                success: false,
                error: 'Echo command failed',
                executionTime,
                userId: message.senderId,
                chatId: message.chatId
            };
        }
    }

    async handleHelp(message: any): Promise<CommandResult> {
        const startTime = Date.now();
        try {
            const helpMessage = `📖 **Available Commands**\n\n` +
                `**Basic Commands:**\n` +
                `.ping - Test bot response\n` +
                `.status - Bot status information\n` +
                `.speed - Speed test\n` +
                `.echo <text> - Echo message\n` +
                `.help - Show this help\n\n` +
                `**More features available!**`;

            await message.reply({
                message: helpMessage,
                parseMode: 'html'
            });

            const executionTime = Date.now() - startTime;
            return {
                success: true,
                message: 'Help command executed',
                executionTime,
                userId: message.senderId,
                chatId: message.chatId
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                success: false,
                error: 'Help command failed',
                executionTime,
                userId: message.senderId,
                chatId: message.chatId
            };
        }
    }

    async handleRestart(message: any): Promise<CommandResult> {
        const startTime = Date.now();
        try {
            await message.reply({
                message: '🔄 **Restarting...**\n\nBot will restart shortly.',
                parseMode: 'html'
            });

            // Simulate restart
            setTimeout(() => {
                process.exit(0);
            }, 2000);

            const executionTime = Date.now() - startTime;
            return {
                success: true,
                message: 'Restart initiated',
                executionTime,
                userId: message.senderId,
                chatId: message.chatId
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                success: false,
                error: 'Restart command failed',
                executionTime,
                userId: message.senderId,
                chatId: message.chatId
            };
        }
    }

    async handleUnknown(message: any, command: string): Promise<CommandResult> {
        const startTime = Date.now();
        try {
            await message.reply({
                message: `❓ Unknown command: **${command}**\n\nUse \`.help\` for available commands.`,
                parseMode: 'html'
            });

            const executionTime = Date.now() - startTime;
            return {
                success: false,
                error: `Unknown command: ${command}`,
                executionTime,
                userId: message.senderId,
                chatId: message.chatId
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                success: false,
                error: 'Failed to handle unknown command',
                executionTime,
                userId: message.senderId,
                chatId: message.chatId
            };
        }
    }
}
