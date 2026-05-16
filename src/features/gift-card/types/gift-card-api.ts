import {DeliveryChannel, GiftCard, GiftCardStatus, GiftCardType} from "./index";
import {PaginationMeta} from "@/types/Types";

export interface GiftCardListResponse {
    data: GiftCard[]
    meta: PaginationMeta
}

export interface GetGiftCardsParams {
    search?: string
    status?: GiftCardStatus
    type?: GiftCardType
    date_from?: string
    date_to?: string
    per_page?: number
    page?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
}
export interface CancelGiftCardRequest {
    reason: string
}
export interface ResendGiftCardRequest {
    delivery_channel: DeliveryChannel
    recipient_email?: string
    recipient_phone?: string
}

export interface ExportGiftCardsParams {
    status?: GiftCardStatus
    type?: GiftCardType
    date_from?: string
    date_to?: string
}