// Re-export all types from individual files
export * from './telegram.js';
export * from './commands.js';
export * from './events.js';

// Main types that were originally in index.ts
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

// Common type aliases for better readability
export type UserID = big64;
export type ChatID = big64;
export type MessageID = number;
export type FileID = string;

// Generic response type for API calls
export interface GenericResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: number;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter types
export interface DateRange {
  start: Date;
  end: Date;
}

export interface TextFilter {
  contains?: string;
  equals?: string;
  startsWith?: string;
  endsWith?: string;
}

// Export commonly used types from telegram
export type {
  Api,
  TelegramClient
} from 'telegram';

// BigInt type for Telegram IDs (since Telegram uses big numbers)
export type big64 = bigint;

// Async result type for better error handling
export type AsyncResult<T, E = Error> = Promise<{ data: T; error: null } | { data: null; error: E }>;

// Configuration type for the entire bot
export interface BotConfiguration {
  telegram: {
    apiId: number;
    apiHash: string;
    sessionString: string;
  };
  features: {
    enableCommands: boolean;
    enableEvents: boolean;
    enableWebServer: boolean;
    enableFileHandling: boolean;
  };
  security: {
    ownerId: big64;
    adminIds: big64[];
    blockedUsers: big64[];
    rateLimit: {
      enabled: boolean;
      maxRequests: number;
      windowMs: number;
    };
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    filePath?: string;
    maxSize: number;
  };
  webServer: {
    port: number;
    enableHealthCheck: boolean;
    enableMetrics: boolean;
  };
}

// State management types
export interface BotState {
  isConnected: boolean;
  startTime: Date;
  totalMessages: number;
  activeChats: number;
  lastError?: Error;
  features: {
    [key: string]: boolean;
  };
}

// Plugin system types (for future extensibility)
export interface Plugin {
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  initialize: (client: TelegramClient) => Promise<void>;
  destroy: () => Promise<void>;
}

export interface PluginManager {
  plugins: Plugin[];
  register: (plugin: Plugin) => void;
  unregister: (name: string) => void;
  enable: (name: string) => void;
  disable: (name: string) => void;
}

// Middleware types
export type Middleware = (ctx: CommandContext, next: () => Promise<void>) => Promise<void>;

export interface MiddlewareStack {
  use: (middleware: Middleware) => void;
  execute: (ctx: CommandContext) => Promise<void>;
}

// Cache types
export interface CacheEntry<T = any> {
  value: T;
  expires: number;
}

export interface CacheStore {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T, ttl?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}
