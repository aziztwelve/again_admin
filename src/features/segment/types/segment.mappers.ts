import type {Segment} from './segment.types'
import type {
    SegmentFormData,
    CreateSegmentRequest,
    UpdateSegmentRequest,
} from './segment-form.types'

/**
 * Конвертировать Segment в SegmentFormData (для редактирования)
 */
export function segmentToFormData(segment: Segment): SegmentFormData {
    return {
        name: segment.name,
        description: segment.description ?? '',
        is_active: segment.is_active,
        recalculate_frequency: segment.recalculate_frequency,

        // Распаковываем conditions
        period: (segment.conditions?.period ?? segment.conditions?.period ??  '') as 'all_time' | 'last_month' | 'last_6_months' | 'last_year' | '',
        min_orders_count: segment.conditions?.min_orders_count ?? null,
        max_orders_count: segment.conditions?.max_orders_count ?? null,
        min_total_amount: segment.conditions?.min_total_amount ?? null,
        min_average_check: segment.conditions?.min_average_check ?? null,
    }
}

/**
 * Конвертировать SegmentFormData в CreateSegmentRequest
 */
export function formDataToCreateRequest(
    formData: SegmentFormData
): CreateSegmentRequest {
    const hasConditions =
        formData.period ||
        formData.min_orders_count !== null ||
        formData.max_orders_count !== null ||
        formData.min_total_amount !== null ||
        formData.min_average_check !== null

    return {
        name: formData.name,
        description: formData.description || null,
        is_active: formData.is_active,
        recalculate_frequency: formData.recalculate_frequency,
        conditions: hasConditions
            ? {
                period: formData.period || null,
                min_orders_count: formData.min_orders_count,
                max_orders_count: formData.max_orders_count,
                min_total_amount: formData.min_total_amount,
                min_average_check: formData.min_average_check,
            }
            : null,
    }
}

/**
 * Конвертировать SegmentFormData в UpdateSegmentRequest
 */
export function formDataToUpdateRequest(
    formData: SegmentFormData
): UpdateSegmentRequest {
    return formDataToCreateRequest(formData)
}