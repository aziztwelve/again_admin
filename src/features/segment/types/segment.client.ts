import {Client} from "@/types/client";

/**
 * Клиент в сегменте
 */
export interface SegmentClient extends Client {
    orders_count: number
    total_amount: number
    average_check: number
    added_to_segment_at: string | null
    registered_at: string
    promo_codes?: string[]
}


/**
 * Управление промокодами сегмента
 */
export interface SegmentClientManager {
    /** ID промокодов, уже прикреплённых к сегменту */
    attached: number[]

    /** ID промокодов, уже прикреплённых к сегменту */
    attachedOriginal: number[]

    /** ID промокодов, ожидающих добавления */
    pendingAttach: number[]

    /** ID промокодов, ожидающих удаления */
    pendingDetach: number[]
}