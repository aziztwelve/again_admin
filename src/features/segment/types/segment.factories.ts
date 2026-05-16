import type { SegmentFormData } from './segment-form.types'
import type { SegmentConditions } from './segment.types'
import { initialSegmentFormData } from './segment.constants'

/**
 * Создать пустую форму сегмента
 */
export function createSegmentFormData(): SegmentFormData {
    return { ...initialSegmentFormData }
}

/**
 * Создать пустые условия
 */
export function createEmptyConditions(): SegmentConditions {
    return {
        period: null,
        min_orders_count: null,
        max_orders_count: null,
        min_total_amount: null,
        min_average_check: null,
    }
}

/**
 * Создать форму с дефолтными значениями
 */
export function createSegmentFormDataWithDefaults(
    defaults: Partial<SegmentFormData>
): SegmentFormData {
    return {
        ...initialSegmentFormData,
        ...defaults,
    }
}