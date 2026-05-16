import {Attachment} from "@/types/conversation";

export type MessageStatus =
    | 'sending'
    | 'sent'
    | 'delivered'
    | 'read'
    | 'failed'

export class Message {
    id: number | undefined
    conversation_id: number | undefined
    direction: 'incoming' | 'outgoing' | undefined
    content: string | undefined
    content_type: string | undefined
    source_data: any | null | undefined
    status: MessageStatus | undefined
    created_at: string | undefined
    updated_at: string | undefined
    attachments: Attachment[] | undefined

    constructor() {
        this.id = undefined
        this.conversation_id = undefined
        this.direction = undefined
        this.content = undefined
        this.content_type = undefined
        this.source_data = undefined
        this.status = undefined
        this.created_at = undefined
        this.updated_at = undefined
        this.attachments = undefined
    }

    static fromJSON(json: any): Message {
        const msg = new Message()
        msg.id = json.id
        msg.conversation_id = json.conversation_id
        msg.direction = json.direction
        msg.content = json.content
        msg.content_type = json.content_type
        msg.source_data = json.source_data ?? null

        // Map status if provided
        if (json.status && isValidStatus(json.status)) {
            msg.status = json.status
        }

        msg.created_at = json.created_at
        msg.updated_at = json.updated_at

        msg.attachments = Array.isArray(json.attachments)
            ? json.attachments.map((att: any) => ({
                id: att.id,
                message_id: att.message_id,
                type: att.type,
                url: att.url,
                file_name: att.file_name,
                file_size: att.file_size,
                file_path: att.file_path,
                mime_type: att.mime_type,
                created_at: att.created_at,
            }))
            : undefined

        return msg
    }
}

// Helper to validate status
function isValidStatus(value: any): value is MessageStatus {
    return [
        'sending',
        'sent',
        'delivered',
        'read',
        'failed',
    ].includes(value)
}
