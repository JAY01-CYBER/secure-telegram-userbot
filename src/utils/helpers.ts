import { Api } from 'telegram';
import type { TelegramClient } from 'telegram';

export class Helpers {
  /**
   * Format time in milliseconds to readable format
   */
  static formatUptime(uptime: number): string {
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Format file size to readable format
   */
  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Sanitize text to prevent injection attacks
   */
  static sanitizeText(text: string): string {
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Check if user is admin in a group
   */
  static async isAdmin(client: TelegramClient, chatId: bigint, userId: bigint): Promise<boolean> {
    try {
      const participants = await client.getParticipants(chatId);
      const user = participants.find(p => p.id === userId);
      
      if (user instanceof Api.ChannelParticipantAdmin || 
          user instanceof Api.ChannelParticipantCreator) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delay execution for specified time
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate random string
   */
  static randomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Truncate text with ellipsis
   */
  static truncateText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Get current timestamp in ISO format
   */
  static getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Parse command arguments
   */
  static parseArgs(text: string): { command: string; args: string[] } {
    const parts = text.trim().split(/\s+/);
    const command = parts[0].startsWith('.') ? parts[0].slice(1) : parts[0];
    const args = parts.slice(1);
    
    return { command: command.toLowerCase(), args };
  }

  /**
   * Check if text contains a command
   */
  static isCommand(text: string): boolean {
    return text.trim().startsWith('.');
  }

  /**
   * Escape markdown characters
   */
  static escapeMarkdown(text: string): string {
    return text
      .replace(/\_/g, '\\_')
      .replace(/\*/g, '\\*')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\~/g, '\\~')
      .replace(/\`/g, '\\`')
      .replace(/\>/g, '\\>')
      .replace(/\#/g, '\\#')
      .replace(/\+/g, '\\+')
      .replace(/\-/g, '\\-')
      .replace(/\=/g, '\\=')
      .replace(/\|/g, '\\|')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\./g, '\\.')
      .replace(/\!/g, '\\!');
  }

  /**
   * Format number with commas
   */
  static formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Calculate percentage
   */
  static calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get user mention string
   */
  static getUserMention(user: any): string {
    if (user.username) {
      return `@${user.username}`;
    } else {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
  }

  /**
   * Convert bytes to MB
   */
  static bytesToMB(bytes: number): number {
    return Math.round((bytes / 1024 / 1024) * 100) / 100;
  }

  /**
   * Check if running in production
   */
  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * Get memory usage in MB
   */
  static getMemoryUsage(): { rss: number; heapTotal: number; heapUsed: number; external: number } {
    const memory = process.memoryUsage();
    return {
      rss: Math.round(memory.rss / 1024 / 1024),
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
      external: Math.round(memory.external / 1024 / 1024)
    };
  }
}

// Export individual functions for convenience
export const {
  formatUptime,
  formatFileSize,
  sanitizeText,
  isAdmin,
  delay,
  randomString,
  truncateText,
  validatePhoneNumber,
  getTimestamp,
  parseArgs,
  isCommand,
  escapeMarkdown,
  formatNumber,
  calculatePercentage,
  validateEmail,
  getUserMention,
  bytesToMB,
  isProduction,
  getMemoryUsage
} = Helpers;
