import type { Attachment } from "./file";
import { Client } from "@/types/client";
import { ChatSource } from "@/types/conversation/source";

export interface Message {
  // Идентификаторы
  id: string | number;
  conversation_id: number;

  // Содержание
  content: string;
  direction: "incoming" | "outgoing";
  status: "sending" | "sent" | "delivered" | "read" | "failed";

  content_type?: "text" | "image" | "file" | "audio" | "video";

  // Временные метки
  created_at: string; // ISO8601
  updated_at?: string;

  // Отправитель/получатель
  sender_id?: number;
  reader_id?: number;

  // Прикрепления
  attachments: Attachment[];
}

// User Model
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "manager" | "support";
  is_online: boolean;
  last_seen_at?: string;
}

// Conversation Model
export interface Conversation {
  // Основное
  id: number;
  client_id: number;
  source: ChatSource;
  external_id?: string;

  // Статус
  status: "active" | "archived" | "closed";
  unread_messages_count: number;

  // Назначение
  assigned_to?: number | null;

  // Временные метки
  last_message?: Message | null;
  last_message_at?: string | null;
  created_at: string;
  updated_at: string | null;

  // Relations
  client: Client | null;
  messages: Message[] | null;
  assigned_user?: User | null;
}

// WebSocket Events
export interface MessageCreatedEvent {
  message: Message;
  conversation_id: number;
}

export interface MessageStatusUpdatedEvent {
  message_id: string | number;
  status: Message["status"];
  conversation_id: number;
}

export interface MessageDeletedEvent {
  message_id: string | number;
  conversation_id: number;
}

export interface UserTypingEvent {
  user_id: number;
  conversation_id: number;
  is_typing: boolean;
}

export interface ConversationUpdatedEvent {
  conversation: Conversation;
}

export interface ConversationAssignedEvent {
  conversation_id: number;
  assigned_to: number | null;
  assigned_user?: User | null;
}
