import type {PaginationMeta} from '@/types/Types'
import type {
    Segment,
    SegmentClient,
    SegmentDetail,
    SegmentStatistics,
} from './index'

/**
 * Список сегментов с пагинацией
 */
export interface SegmentListResponse {
    data: Segment[]
    meta: PaginationMeta
}

/**
 * Одиночный сегмент
 */
export interface SegmentResponse {
    success: boolean
    message?: string
    data: Segment
}

/**
 * Детальный сегмент (с форматированными условиями)
 */
export interface SegmentDetailResponse {
    success: boolean
    data: SegmentDetail
}

/**
 * Список клиентов сегмента с пагинацией
 */
export interface SegmentClientsResponse {
    data: SegmentClient[]
    meta: PaginationMeta
}

/**
 * Статистика сегмента
 */
export interface SegmentStatisticsResponse {
    success: boolean
    data: SegmentStatistics
}

/**
 * Ответ при добавлении/удалении клиентов
 */
export interface AttachDetachResponse {
    success: boolean
    message: string
    data: {
        added_count?: number
        removed_count?: number
        total_clients: number
    }
}

/**
 * Ответ при добавлении/удалении промокодов
 */
export interface AttachDetachPromoCodesResponse {
    success: boolean
    message: string
    data: {
        attached_count?: number
        detached_count?: number
        total_promo_codes: number
    }
}

/**
 * Ответ при пересчёте сегмента
 */
export interface RecalculateResponse {
    success: boolean
    message: string
    data: {
        clients_count: number
        last_recalculated_at: string
    }
}

/**
 * Ответ при переключении активности
 */
export interface ToggleActiveResponse {
    success: boolean
    message: string
    data: {
        is_active: boolean
    }
}

/**
 * Предпросмотр экспорта
 */
export interface ExportPreviewResponse {
    success: boolean
    data: {
        preview: any[]
        total_count: number
        headers: Record<string, string>
    }
}