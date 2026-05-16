import type {SegmentConditions} from './segment.types'

/**
 * Форма создания/редактирования сегмента
 */
export interface SegmentFormData {
    name: string
    description: string
    is_active: boolean
    recalculate_frequency: 'on_view' | 'manual'

    period: 'all_time' | 'last_month' | 'last_6_months' | 'last_year' | ''
    min_orders_count: number | null
    max_orders_count: number | null
    min_total_amount: number | null
    min_average_check: number | null
}

/**
 * Request для создания сегмента
 */
export interface CreateSegmentRequest {
    name: string
    description?: string | null
    conditions?: SegmentConditions | null
    is_active?: boolean
    recalculate_frequency?: 'on_view' | 'manual'
}

/**
 * Request для обновления сегмента
 */
export interface UpdateSegmentRequest {
    name?: string
    description?: string | null
    conditions?: SegmentConditions | null
    is_active?: boolean
    recalculate_frequency?: 'on_view' | 'manual'
}

/**
 * Request для добавления клиентов
 */
export interface AttachClientsRequest {
    client_ids: number[]
}

/**
 * Request для добавления промокодов
 */
export interface AttachPromoCodesRequest {
    promo_code_ids: number[]
    auto_apply?: boolean
}

/**
 * Параметры фильтрации клиентов сегмента
 */
export interface FilterSegmentClientsParams {
    search?: string
    period_from?: string
    period_to?: string
    min_total_amount?: number
    max_total_amount?: number
    per_page?: number
    page?: number
    sort_by?: 'created_at' | 'total_amount' | 'average_check' | 'orders_count'
    sort_direction?: 'asc' | 'desc'
}

/**
 * Параметры получения списка сегментов
 */
export interface GetSegmentsParams {
    search?: string
    is_active?: boolean
    per_page?: number
    page?: number
    sort_by?: 'created_at' | 'name' | 'clients_count'
    sort_direction?: 'asc' | 'desc'
}

/**
 * Параметры экспорта сегмента
 */
export interface ExportSegmentParams {
    columns?: (
        | 'id'
        | 'full_name'
        | 'phone'
        | 'email'
        | 'birthday'
        | 'address'
        | 'average_check'
        | 'total_amount'
        | 'orders_count'
        )[]
}