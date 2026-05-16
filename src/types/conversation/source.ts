export type ChatSource = 'vk' | 'telegram' | 'whatsapp' | 'web_chat' | 'email' | 'all'

export interface ChatSourceObj {
    source: ChatSource
}