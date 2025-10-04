import { TelegramClient } from 'telegram';
import { Api } from 'telegram';

export class Helpers {
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
            // Convert bigint to string for Telegram API
            const participants = await client.getParticipants(chatId.toString());
            
            // Find user and check admin status
            for (const participant of participants) {
                if (participant.id && BigInt(participant.id.toString()) === userId) {
                    // Check if participant is admin or creator
                    if (participant instanceof Api.ChannelParticipantAdmin ||
                        participant instanceof Api.ChannelParticipantCreator) {
                        return true;
                    }
                }
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
     * Get memory usage in MB
     */
    static getMemoryUsage() {
        const memory = process.memoryUsage();
        return {
            rss: Math.round(memory.rss / 1024 / 1024),
            heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
            heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
            external: Math.round(memory.external / 1024 / 1024)
        };
    }

    /**
     * Format uptime to readable string
     */
    static formatUptime(seconds: number): string {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

        return parts.join(' ');
    }

    /**
     * Parse command arguments
     */
    static parseArgs(text: string): { command: string; args: string[] } {
        const parts = text.slice(1).trim().split(/\s+/);
        return {
            command: parts[0]?.toLowerCase() || '',
            args: parts.slice(1)
        };
    }

    /**
     * Validate email format
     */
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate URL format
     */
    static isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Capitalize first letter of each word
     */
    static capitalizeWords(str: string): string {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    /**
     * Generate random number in range
     */
    static randomInRange(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Check if string contains only numbers
     */
    static isNumeric(str: string): boolean {
        return /^\d+$/.test(str);
    }

    /**
     * Format date to readable string
     */
    static formatDate(date: Date): string {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Deep clone object
     */
    static deepClone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Debounce function
     */
    static debounce<T extends (...args: any[]) => any>(
        func: T,
        wait: number
    ): (...args: Parameters<T>) => void {
        let timeout: NodeJS.Timeout;
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(null, args), wait);
        };
    }

    /**
     * Throttle function
     */
    static throttle<T extends (...args: any[]) => any>(
        func: T,
        limit: number
    ): (...args: Parameters<T>) => void {
        let inThrottle: boolean;
        return (...args: Parameters<T>) => {
            if (!inThrottle) {
                func.apply(null, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}
