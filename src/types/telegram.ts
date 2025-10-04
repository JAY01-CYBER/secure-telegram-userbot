import { Api } from 'telegram';

// Extended message type with additional properties
export interface ExtendedMessage extends Api.Message {
  _client?: any;
  _text?: string;
  _sender?: Api.User;
  _chat?: Api.Chat | Api.Channel;
}

// Custom user type
export interface ExtendedUser extends Api.User {
  fullName: string;
  mention: string;
  isAdmin?: boolean;
  isOwner?: boolean;
}

// Chat participant with role
export interface ChatParticipant {
  user: ExtendedUser;
  role: 'member' | 'admin' | 'creator';
  joined?: Date;
  promotedBy?: ExtendedUser;
}

// Media information
export interface MediaInfo {
  type: 'photo' | 'video' | 'document' | 'audio' | 'voice' | 'sticker';
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  mimeType?: string;
  fileName?: string;
}

// Message entity for parsing
export interface MessageEntity {
  type: 'bold' | 'italic' | 'code' | 'pre' | 'text_link' | 'mention' | 'hashtag' | 'cashtag' | 'bot_command' | 'url' | 'email' | 'phone_number' | 'text_mention';
  offset: number;
  length: number;
  url?: string;
  user?: ExtendedUser;
}

// Inline keyboard button
export interface InlineButton {
  text: string;
  callbackData?: string;
  url?: string;
  switchInlineQuery?: string;
}

// Inline keyboard row
export type InlineKeyboardRow = InlineButton[];

// Inline keyboard markup
export interface InlineKeyboard {
  inlineKeyboard: InlineKeyboardRow[];
}

// Reply keyboard button
export interface ReplyButton {
  text: string;
  requestContact?: boolean;
  requestLocation?: boolean;
}

// Reply keyboard row
export type ReplyKeyboardRow = ReplyButton[];

// Reply keyboard markup
export interface ReplyKeyboard {
  keyboard: ReplyKeyboardRow[];
  resizeKeyboard?: boolean;
  oneTimeKeyboard?: boolean;
  selective?: boolean;
}

// Force reply markup
export interface ForceReply {
  forceReply: true;
  selective?: boolean;
  placeholder?: string;
}

// All keyboard types
export type ReplyMarkup = InlineKeyboard | ReplyKeyboard | ForceReply;

// Message options for sending
export interface MessageOptions {
  parseMode?: 'html' | 'markdown';
  replyTo?: number;
  buttons?: ReplyMarkup;
  silent?: boolean;
  schedule?: Date;
  noWebpage?: boolean;
}
