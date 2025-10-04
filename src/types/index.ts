import { Api } from 'telegram';
import type { TelegramClient } from 'telegram';

// Command related types
export interface CommandContext {
  client: TelegramClient;
  message: any;
  sender: any;
  chat: any;
  args: string[];
  command: string;
}

export interface CommandHandler {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  execute: (ctx: CommandContext) => Promise<void>;
}

export interface CommandRegistry {
  [key: string]: CommandHandler;
}

// Event related types
export interface EventHandler {
  event: string;
  handler: (client: TelegramClient, event: any) => Promise<void>;
}

export interface NewMessageEvent {
  message: Api.Message;
  client: TelegramClient;
}

export interface EditedMessageEvent {
  message: Api.Message;
  client: TelegramClient;
}

// User related types
export interface UserInfo {
  id: big64;
  firstName: string;
  lastName?: string;
  username?: string;
  phone?: string;
  isBot: boolean;
  isPremium?: boolean;
}

export interface ChatInfo {
  id: big64;
  title?: string;
  type: 'private' | 'group' | 'channel' | 'supergroup';
  participantsCount?: number;
  isChannel?: boolean;
}

// Bot configuration types
export interface BotConfig {
  apiId: number;
  apiHash: string;
  sessionString: string;
  ownerId: big64;
  adminIds: big64[];
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  maxFileSize: number;
  allowedChats: big64[];
  blockedUsers: big64[];
}

export interface RuntimeConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  logToFile: boolean;
  enableWebServer: boolean;
  healthCheckInterval: number;
}

// Response types
export interface BotResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  timestamp: Date;
}

export interface CommandResponse {
  text: string;
  parseMode?: 'html' | 'markdown';
  replyTo?: number;
  buttons?: Api.ReplyInlineMarkup[];
}

// Logger types
export interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug' | 'success';
  message: string;
  timestamp: Date;
  context?: any;
  userId?: big64;
  chatId?: big64;
}

export interface LoggerConfig {
  level: string;
  filePath?: string;
  maxFileSize: number;
  maxFiles: number;
}

// Security types
export interface SecurityCheck {
  isValid: boolean;
  issues: string[];
  warnings: string[];
}

export interface RateLimitInfo {
  userId: big64;
  command: string;
  count: number;
  lastUsed: Date;
  isBlocked: boolean;
}

// Handler types
export interface MessageHandler {
  pattern: string | RegExp;
  handler: (ctx: CommandContext) => Promise<void>;
  description: string;
}

export interface EventMap {
  [eventName: string]: Function[];
}

// Database types (for future use)
export interface UserData {
  userId: big64;
  firstName: string;
  username?: string;
  joinDate: Date;
  messageCount: number;
  lastSeen: Date;
  isBlocked: boolean;
}

export interface ChatData {
  chatId: big64;
  title: string;
  type: string;
  memberCount: number;
  isActive: boolean;
  settings: ChatSettings;
}

export interface ChatSettings {
  welcomeMessage?: string;
  goodbyeMessage?: string;
  allowCommands: boolean;
  allowMedia: boolean;
  maxWarnings: number;
  adminOnly: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  ok: boolean;
  result?: T;
  error?: string;
  description?: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  timestamp: Date;
  version: string;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type Nullable<T> = T | null;
export type MaybeArray<T> = T | T[];

// Environment variables type
export interface ProcessEnv {
  API_ID: string;
  API_HASH: string;
  SESSION_STRING: string;
  PORT: string;
  NODE_ENV: 'development' | 'production' | 'test';
  LOG_LEVEL: string;
  OWNER_ID: string;
  [key: string]: string | undefined;
}

// Export commonly used types
export type {
  Api,
  TelegramClient
} from 'telegram';
