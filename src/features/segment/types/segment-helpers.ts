import {SegmentFormData} from "@/features/segment/types/segment-form.types";
import {Segment} from "@/features/segment/types/segment.types";

/**
 * Синхронизирует изменения из SegmentFormData обратно в Segment
 */
export function syncFormDataToSegment(formData: SegmentFormData, segment: Segment): void {
    segment.name = formData.name
    segment.description = formData.description || null
    segment.is_active = formData.is_active
    segment.recalculate_frequency = formData.recalculate_frequency

    const hasConditions =
        formData.period ||
        formData.min_orders_count !== null ||
        formData.max_orders_count !== null ||
        formData.min_total_amount !== null ||
        formData.min_average_check !== null

    if (hasConditions) {
        segment.conditions = {
            period: formData.period || null,
            min_orders_count: formData.min_orders_count,
            max_orders_count: formData.max_orders_count,
            min_total_amount: formData.min_total_amount,
            min_average_check: formData.min_average_check,
        }
    } else {
        segment.conditions = null
    }
}