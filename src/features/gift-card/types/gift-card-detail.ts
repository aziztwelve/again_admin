// features/gift-card/types/detail.ts

import { GiftCard, TransactionType } from "./index"

export interface GiftCardDetail extends Omit<GiftCard, 'sender_name' | 'sender_email' | 'sender_phone' | 'recipient_name' | 'recipient_email' | 'recipient_phone'> {
    // Отправитель
    sender: {
        name: string | null
        email: string | null
        phone: string | null
    }

    // Получатель
    recipient: {
        name: string | null
        email: string | null
        phone: string | null
    }

    // Доставка
    delivery: {
        channel: string | null
        message: string | null
        scheduled_at: string | null
        timezone: string | null
        sent_at: string | null
        delivered_at: string | null
    }

    // Статистика использования
    usage: {
        is_active: boolean
        is_fully_used: boolean
        used_amount: number
        usage_percentage: number
    }

    // Заказ покупки
    purchase_order?: {
        id: number
        order_number: string
        created_at: string
        client?: {
            id: number
            profile?: {
                full_name: string
                email: string
                phone: string
            }
        }
    }

    // Транзакции
    transactions?: GiftCardTransaction[]

    // Заказы где использовалась карта
    used_in_orders?: {
        id: number
        order_number: string
        amount_used: number
        created_at: string
        client?: {
            id: number
            profile?: {
                full_name: string
            }
        }
    }[]
}

export interface GiftCardTransaction {
    id: number
    type: TransactionType
    amount: number
    balance_before: number
    balance_after: number
    notes: string | null
    order?: {
        id: number
        order_number: string
        created_at: string
    }
    created_at: string
}

export interface GiftCardStatistics {
    total_cards: number
    active_cards: number
    used_cards: number
    cancelled_cards: number
    total_nominal: number
    total_balance: number
    total_used_amount: number
    by_type: {
        electronic: number
        plastic: number
    }
    by_nominal: Record<string, number>
}
