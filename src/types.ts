/*
 * meta-messenger.js
 * Unofficial Meta Messenger Chat API for Node.js
 *
 * Copyright (c) 2026 Yumi Team and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Event types emitted by the client
 */
export type EventType =
    | "ready"
    | "reconnected"
    | "disconnected"
    | "error"
    | "message"
    | "messageEdit"
    | "messageUnsend"
    | "reaction"
    | "typing"
    | "readReceipt"
    | "e2eeConnected"
    | "e2eeMessage"
    | "e2eeReaction"
    | "e2eeReceipt"
    | "deviceDataChanged";

/**
 * Base event interface
 */
export interface BaseEvent {
    type: EventType;
    timestamp: number;
}

/**
 * Ready event - emitted when connected to Messenger
 */
export interface ReadyEvent extends BaseEvent {
    type: "ready";
    data: {
        isNewSession: boolean;
    };
}

/**
 * Reconnected event
 */
export interface ReconnectedEvent extends BaseEvent {
    type: "reconnected";
}

/**
 * Disconnected event
 */
export interface DisconnectedEvent extends BaseEvent {
    type: "disconnected";
    data?: {
        isE2EE?: boolean;
    };
}

/**
 * Error event
 */
export interface ErrorEvent extends BaseEvent {
    type: "error";
    data: {
        message: string;
        /** Error code. If code = 1, this is a permanent error (session invalid, should stop event loop) */
        code?: number;
    };
}

/**
 * Message event - new message received
 */
export interface MessageEvent extends BaseEvent {
    type: "message";
    data: Message;
}

/**
 * Message edit event
 */
export interface MessageEditEvent extends BaseEvent {
    type: "messageEdit";
    data: {
        messageId: string;
        threadId: number;
        newText: string;
        editCount?: number;
        timestampMs?: number;
    };
}

/**
 * Message unsend event
 */
export interface MessageUnsendEvent extends BaseEvent {
    type: "messageUnsend";
    data: {
        messageId: string;
        threadId: number;
    };
}

/**
 * Reaction event
 */
export interface ReactionEvent extends BaseEvent {
    type: "reaction";
    data: {
        messageId: string;
        threadId: number;
        actorId: number;
        reaction: string;
        timestampMs: number;
    };
}

/**
 * Typing event
 */
export interface TypingEvent extends BaseEvent {
    type: "typing";
    data: {
        threadId: number;
        senderId: number;
        isTyping: boolean;
    };
}

/**
 * Read receipt event
 */
export interface ReadReceiptEvent extends BaseEvent {
    type: "readReceipt";
    data: {
        threadId: number;
        readerId: number;
        readWatermarkTimestampMs: number;
        timestampMs?: number;
    };
}

/**
 * E2EE connected event
 */
export interface E2EEConnectedEvent extends BaseEvent {
    type: "e2eeConnected";
}

/**
 * E2EE message event
 */
export interface E2EEMessageEvent extends BaseEvent {
    type: "e2eeMessage";
    data: E2EEMessage;
}

/**
 * E2EE reaction event
 */
export interface E2EEReactionEvent extends BaseEvent {
    type: "e2eeReaction";
    data: {
        messageId: string;
        chatJid: string;
        senderJid: string;
        reaction: string;
    };
}

/**
 * E2EE receipt event
 */
export interface E2EEReceiptEvent extends BaseEvent {
    type: "e2eeReceipt";
    data: {
        type: string;
        chat: string;
        sender: string;
        messageIds: string[];
    };
}

/**
 * Device data changed event - emitted when E2EE device data changes (only when using deviceData option)
 */
export interface DeviceDataChangedEvent extends BaseEvent {
    type: "deviceDataChanged";
    data: {
        deviceData: string;
    };
}

/**
 * Union of all events
 */
export type ClientEvent =
    | ReadyEvent
    | ReconnectedEvent
    | DisconnectedEvent
    | ErrorEvent
    | MessageEvent
    | MessageEditEvent
    | MessageUnsendEvent
    | ReactionEvent
    | TypingEvent
    | ReadReceiptEvent
    | E2EEConnectedEvent
    | E2EEMessageEvent
    | E2EEReactionEvent
    | E2EEReceiptEvent
    | DeviceDataChangedEvent;

/**
 * User information
 */
export interface User {
    id: number;
    name: string;
    username: string;
}

/**
 * Thread/conversation
 */
export interface Thread {
    id: number;
    type: ThreadType;
    name: string;
    lastActivityTimestampMs: number;
    snippet: string;
}

/**
 * Thread types
 */
export enum ThreadType {
    ONE_TO_ONE = 1,
    GROUP = 2,
    PAGE = 3,
    MARKETPLACE = 4,
    ENCRYPTED_ONE_TO_ONE = 7,
    ENCRYPTED_GROUP = 8,
}

/**
 * Attachment type
 */
export type AttachmentType = "image" | "video" | "audio" | "file" | "sticker" | "gif" | "voice" | "location" | "link";

/**
 * Media attachment
 */
export interface Attachment {
    /** Attachment type */
    type: AttachmentType;
    /** URL to download media (for regular messages) or the link URL (for link attachments) */
    url?: string;
    /** Original filename or link title */
    fileName?: string;
    /** MIME type (e.g., 'image/jpeg') */
    mimeType?: string;
    /** File size in bytes */
    fileSize?: number;
    /** Image/video width in pixels */
    width?: number;
    /** Image/video height in pixels */
    height?: number;
    /** Duration in seconds (for audio/video) */
    duration?: number;
    /** Sticker ID (for stickers) */
    stickerId?: number;
    /** Location latitude */
    latitude?: number;
    /** Location longitude */
    longitude?: number;
    /** Preview/thumbnail URL */
    previewUrl?: string;
    /** Link description/subtitle (for link attachments) */
    description?: string;
    /** Source domain text (for link attachments) */
    sourceText?: string;
    mediaKey?: string;
    /** Base64 encoded SHA256 hash of the decrypted file (E2EE only) */
    mediaSha256?: string;
    /** Base64 encoded SHA256 hash of the encrypted file (E2EE only) */
    mediaEncSha256?: string;
    /** Direct path for E2EE media download (E2EE only) */
    directPath?: string;
}

/**
 * Reply info
 */
export interface ReplyTo {
    messageId: string;
    senderId?: number;
    text?: string;
}

/**
 * Mention in message
 */
export interface Mention {
    userId: number;
    offset: number;
    length: number;
    /** Mention type: user (person), page, group, or thread */
    type?: "user" | "page" | "group" | "thread";
}

/**
 * Message
 */
export interface Message {
    id: string;
    threadId: number;
    senderId: number;
    text: string;
    timestampMs: number;
    isE2EE?: boolean;
    chatJid?: string;
    senderJid?: string;
    attachments?: Attachment[];
    replyTo?: ReplyTo;
    mentions?: Mention[];
    isAdminMsg?: boolean;
}

/**
 * E2EE Message
 */
export interface E2EEMessage {
    id: string;
    threadId: number;
    chatJid: string;
    senderJid: string;
    senderId: number;
    text: string;
    timestampMs: number;
    attachments?: Attachment[];
    replyTo?: ReplyTo;
    mentions?: Mention[];
}

/**
 * Read receipt event data
 */
export interface ReadReceiptData {
    threadId: number;
    readerId: number;
    readWatermarkTimestampMs: number;
    timestampMs?: number;
}

/**
 * Initial data received on connect
 */
export interface InitialData {
    threads: Thread[];
    messages: Message[];
}

/**
 * Platform type
 */
export type Platform = "facebook" | "messenger" | "instagram";

/**
 * Log level
 */
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "none";

/**
 * Cookies required for authentication
 */
export interface Cookies {
    c_user: string;
    xs: string;
    datr?: string;
    fr?: string;
    [key: string]: string | undefined;
}

/**
 * Client options
 */
export interface ClientOptions {
    /** Platform to connect to (Only tested on Facebook) */
    platform?: Platform;
    /** Path to E2EE device store (if not using deviceData) */
    devicePath?: string;
    /** E2EE device data as JSON string (takes priority over devicePath) */
    deviceData?: string;
    /** If true, E2EE state is stored in memory only (no file, no events). State will be lost on disconnect. Default: true */
    e2eeMemoryOnly?: boolean;
    /** Log level */
    logLevel?: LogLevel;
    /** Enable E2EE. Default: true */
    enableE2EE?: boolean;
    /** Auto reconnect on disconnect */
    autoReconnect?: boolean;
}

/**
 * Send message options
 */
export interface SendMessageOptions {
    /** Text content */
    text: string;
    /** Reply to message ID */
    replyToId?: string;
    /** User IDs to mention */
    mentions?: Array<{
        userId: number;
        offset: number;
        length: number;
    }>;
}

/**
 * Send message result
 */
export interface SendMessageResult {
    messageId: string;
    timestampMs: number;
}

/**
 * Upload media result
 */
export interface UploadMediaResult {
    fbId: number;
    filename: string;
}

/**
 * Search user result
 */
export interface SearchUserResult {
    id: number;
    name: string;
    username: string;
}

/**
 * Create thread result (1:1 chat)
 */
export interface CreateThreadResult {
    threadId: number;
}

/**
 * User information
 */
export interface UserInfo {
    id: number;
    name: string;
    firstName?: string;
    username?: string;
    profilePictureUrl?: string;
    isMessengerUser?: boolean;
    isVerified?: boolean;
    gender?: number;
    canViewerMessage?: boolean;
}
