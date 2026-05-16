import type { PaginationMeta } from '@/types/Types'
import type { OtoBanner, OtoBannerListItem, OtoBannerSubmission } from './index'

/**
 * Ответ API со списком баннеров
 */
export interface OtoBannerListResponse {
    success: boolean
    data: OtoBanner[]
    meta: PaginationMeta
}

/**
 * Ответ API с одним баннером
 */
export interface OtoBannerDetailResponse {
    success: boolean
    data: OtoBanner
}

/**
 * Ответ API со списком заявок
 */
export interface OtoBannerSubmissionsResponse {
    success: boolean
    data: OtoBannerSubmission[]
    meta: PaginationMeta
}

/**
 * Ответ API с аналитикой
 */
export interface OtoBannerAnalyticsResponse {
    success: boolean
    data: any
}