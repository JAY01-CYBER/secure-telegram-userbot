import { Api } from 'telegram';
import type { TelegramClient } from 'telegram';

// Base event type
export interface BaseEvent {
  type: string;
  client: TelegramClient;
  timestamp: Date;
}

// Message events
export interface MessageEvent extends BaseEvent {
  type: 'message';
  message: Api.Message;
}

export interface EditedMessageEvent extends BaseEvent {
  type: 'edited_message';
  message: Api.Message;
}

export interface DeletedMessageEvent extends BaseEvent {
  type: 'deleted_message';
  messageIds: number[];
  chatId: big64;
}

// User events
export interface UserJoinedEvent extends BaseEvent {
  type: 'user_joined';
  user: Api.User;
  chat: Api.Chat | Api.Channel;
  inviter?: Api.User;
}

export interface UserLeftEvent extends BaseEvent {
  type: 'user_left';
  user: Api.User;
  chat: Api.Chat | Api.Channel;
}

export interface UserBannedEvent extends BaseEvent {
  type: 'user_banned';
  user: Api.User;
  chat: Api.Chat | Api.Channel;
  bannedBy: Api.User;
}

// Chat events
export interface ChatCreatedEvent extends BaseEvent {
  type: 'chat_created';
  chat: Api.Chat | Api.Channel;
  createdBy: Api.User;
}

export interface ChatTitleChangedEvent extends BaseEvent {
  type: 'chat_title_changed';
  chat: Api.Chat | Api.Channel;
  oldTitle: string;
  newTitle: string;
  changedBy: Api.User;
}

export interface ChatPhotoChangedEvent extends BaseEvent {
  type: 'chat_photo_changed';
  chat: Api.Chat | Api.Channel;
  oldPhoto?: Api.Photo;
  newPhoto?: Api.Photo;
  changedBy: Api.User;
}

// Media events
export interface PhotoUploadedEvent extends BaseEvent {
  type: 'photo_uploaded';
  message: Api.Message;
  photo: Api.Photo;
}

export interface VideoUploadedEvent extends BaseEvent {
  type: 'video_uploaded';
  message: Api.Message;
  video: Api.Document;
}

export interface FileUploadedEvent extends BaseEvent {
  type: 'file_uploaded';
  message: Api.Message;
  file: Api.Document;
  fileSize: number;
}

// Callback query events
export interface CallbackQueryEvent extends BaseEvent {
  type: 'callback_query';
  query: Api.UpdateBotCallbackQuery;
  data: string;
  message: Api.Message;
  user: Api.User;
}

// Inline query events
export interface InlineQueryEvent extends BaseEvent {
  type: 'inline_query';
  query: Api.UpdateBotInlineQuery;
  queryText: string;
  user: Api.User;
  offset: string;
}

// Bot events
export interface BotStartedEvent extends BaseEvent {
  type: 'bot_started';
  user: Api.User;
}

export interface BotStoppedEvent extends BaseEvent {
  type: 'bot_stopped';
  reason: string;
}

// System events
export interface ConnectionStateEvent extends BaseEvent {
  type: 'connection_state';
  state: 'connected' | 'disconnected' | 'reconnecting';
  reason?: string;
}

export interface ErrorEvent extends BaseEvent {
  type: 'error';
  error: Error;
  context?: any;
}

// Union type of all events
export type BotEvent = 
  | MessageEvent
  | EditedMessageEvent
  | DeletedMessageEvent
  | UserJoinedEvent
  | UserLeftEvent
  | UserBannedEvent
  | ChatCreatedEvent
  | ChatTitleChangedEvent
  | ChatPhotoChangedEvent
  | PhotoUploadedEvent
  | VideoUploadedEvent
  | FileUploadedEvent
  | CallbackQueryEvent
  | InlineQueryEvent
  | BotStartedEvent
  | BotStoppedEvent
  | ConnectionStateEvent
  | ErrorEvent;

// Event handler function
export type EventHandler<T extends BotEvent = BotEvent> = (event: T) => Promise<void>;

// Event listener registration
export interface EventListener {
  event: string;
  handler: EventHandler;
  once?: boolean;
}
