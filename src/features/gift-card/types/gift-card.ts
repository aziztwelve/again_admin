import {DeliveryChannel, GiftCardStatus, GiftCardType} from "./index";

export interface GiftCard {
    id: number
    code: string
    purchase_order_id: number | null
    nominal: string | number
    balance: string | number
    type: GiftCardType
    status: GiftCardStatus
    sender_name: string | null
    sender_email: string | null
    sender_phone: string | null
    recipient_name: string | null
    recipient_email: string | null
    recipient_phone: string | null
    message: string | null
    delivery_channel: DeliveryChannel
    scheduled_at: string | null
    timezone: string | null
    sent_at: string | null
    delivered_at: string | null
    created_at: string
    updated_at: string
    deleted_at: string | null
}