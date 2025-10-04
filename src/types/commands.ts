import { CommandContext } from './index.js';

// Command permission levels
export enum PermissionLevel {
  USER = 0,
  ADMIN = 1,
  OWNER = 2,
  SYSTEM = 3
}

// Command category
export enum CommandCategory {
  GENERAL = 'general',
  ADMIN = 'admin',
  UTILITY = 'utility',
  FUN = 'fun',
  MEDIA = 'media',
  SYSTEM = 'system'
}

// Command cooldown configuration
export interface CooldownConfig {
  userId: big64;
  command: string;
  duration: number; // in milliseconds
  lastUsed: Date;
}

// Command usage statistics
export interface CommandStats {
  command: string;
  usageCount: number;
  lastUsed: Date;
  averageResponseTime: number;
  errorCount: number;
  users: big64[];
}

// Command help information
export interface CommandHelp {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  aliases: string[];
  category: CommandCategory;
  permission: PermissionLevel;
  cooldown: number; // in seconds
  arguments: CommandArgument[];
}

// Command argument definition
export interface CommandArgument {
  name: string;
  description: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'user' | 'chat' | 'file';
  defaultValue?: any;
  validation?: (value: any) => boolean;
}

// Command execution result
export interface CommandResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
  executionTime: number;
  userId: big64;
  chatId: big64;
}

// Command middleware function
export type CommandMiddleware = (ctx: CommandContext, next: () => Promise<void>) => Promise<void>;

// Command registration options
export interface CommandOptions {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  category?: CommandCategory;
  permission?: PermissionLevel;
  cooldown?: number;
  arguments?: CommandArgument[];
  middleware?: CommandMiddleware[];
  hidden?: boolean;
}

// Command class interface
export interface ICommand {
  name: string;
  description: string;
  usage: string;
  aliases: string[];
  category: CommandCategory;
  permission: PermissionLevel;
  cooldown: number;
  arguments: CommandArgument[];
  
  execute(ctx: CommandContext): Promise<CommandResult>;
  validateArgs(args: string[]): boolean;
  getHelp(): CommandHelp;
}
