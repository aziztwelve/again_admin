import {PromoCode} from "@/types/promo-code";
import {SegmentClient} from "@/features/segment/types";


/**
 * Основная модель сегмента
 */
export interface Segment {
    id: number
    name: string
    description: string | null
    conditions: SegmentConditions | null
    is_active: boolean
    recalculate_frequency: 'on_view' | 'manual'
    last_recalculated_at: string | null
    clients_count?: number
    promo_codes_count?: number
    created_at: string
    updated_at: string

    // Связи (загружаются только при необходимости)
    clients?: SegmentClient[]
    promo_codes?: SegmentPromoCodeBrief[]

    // Статистика (только в списке)
    statistics?: SegmentBriefStatistics
}

/**
 * Условия фильтрации клиентов для сегмента
 */
export interface SegmentConditions {
    period?: 'all_time' | 'last_month' | 'last_6_months' | 'last_year' | null
    min_orders_count?: number | null
    max_orders_count?: number | null
    min_total_amount?: number | null
    min_average_check?: number | null
}

/**
 * Форматированные условия (из SegmentDetailResource)
 */
export interface FormattedSegmentConditions {
    period?: {
        value: string
        label: string
    }
    orders_count?: {
        min: number | null
        max: number | null
        label: string
    }
    total_amount?: {
        min: number
        label: string
    }
    average_check?: {
        min: number
        label: string
    }
}



/**
 * Краткая информация о промокоде
 */
export interface SegmentPromoCodeBrief extends Pick<
    PromoCode,
    | 'id'
    | 'code'
    | 'description'
    | 'discount_amount'
    | 'discount_type'
    | 'expires_at'
    | 'is_active'
    | 'image_url'
> {
    discount_type_label: string
    auto_apply: boolean
}

/**
 * Краткая статистика (для списка сегментов)
 */
export interface SegmentBriefStatistics {
    clients_count: number
    total_amount: number
    average_check: number
    total_orders: number
}

/**
 * Полная статистика сегмента
 */
export interface SegmentStatistics {
    clients_count: number
    total_amount: {
        value: number
        formatted: string
    }
    average_check: {
        value: number
        formatted: string
    }
    total_orders: number
    top_clients?: TopClient[]
}

/**
 * Топ клиент
 */
export interface TopClient {
    id: number
    full_name: string
    email: string
    orders_count: number
    total_amount: number
    average_check: number
}

/**
 * Детальная информация о сегменте (из SegmentDetailResource)
 */
export interface SegmentDetail extends Omit<Segment, 'conditions'> {
    conditions: FormattedSegmentConditions | null
}