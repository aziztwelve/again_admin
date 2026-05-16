import {Client} from '@/models/client/Client' // или определи локально
import {User} from '@/models/user/User'     // если есть
import {Message} from '@/models/Message'

export class Conversation {
    id: number | undefined
    client_id?: number | undefined
    external_id?: string | undefined
    source: 'telegram' | 'whatsapp' | 'web_chat' | 'vk' | 'email' | undefined
    status: 'new' | 'open' | 'closed' | 'sending' | undefined
    unread_messages_count?: number | undefined
    last_message_at?: string | undefined
    created_at?: string | undefined
    updated_at?: string | undefined
    source_data?: any | null | undefined
    assigned_to?: number | null | undefined



    // Вложенные объекты
    client: Client | undefined
    assigned_user: User | null | undefined
    last_message: Message | undefined


    messages: Message[] | undefined
    participants: any[] | undefined

    constructor() {
        this.id = undefined
        this.client_id = undefined
        this.external_id = undefined
        this.source = undefined
        this.status = undefined
        this.unread_messages_count = undefined
        this.last_message_at = undefined
        this.created_at = undefined
        this.updated_at = undefined
        this.source_data = undefined
        this.assigned_to = undefined


        this.client = undefined
        this.assigned_user = undefined
        this.last_message = undefined

        this.messages = undefined
        this.participants = undefined

    }

    static fromJSON(json: any): Conversation {
        const convo = new Conversation()
        convo.id = json.id
        convo.client_id = json.client_id
        convo.external_id = json.external_id
        convo.source = json.source
        convo.status = json.status
        convo.unread_messages_count = json.unread_messages_count
        convo.last_message_at = json.last_message_at
        convo.created_at = json.created_at
        convo.updated_at = json.updated_at
        convo.source_data = json.source_data
        convo.assigned_to = json.assigned_to ?? null



        convo.client = json.client ? Client.fromJSON(json.client) : undefined
        convo.assigned_user = json.assigned_user ? User.fromJSON(json.assigned_user) : null
        convo.last_message = json.last_message ? Message.fromJSON(json.last_message) : undefined

        convo.messages = Array.isArray(json.messages)
            ? json.messages.map((m: any) => Message.fromJSON(m))
            : []

        convo.participants = Array.isArray(json.participants)
            ? json.participants
            : []

        return convo
    }
}
