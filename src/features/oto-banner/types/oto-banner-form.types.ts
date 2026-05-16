/**
 * Форма создания/редактирования OTO баннера
 */
export interface OtoBannerFormData {
    name: string
    status: 'active' | 'inactive'
    device_type: 'desktop' | 'mobile'

    title: string
    subtitle: string

    button_enabled: boolean
    button_text: string

    input_field_enabled: boolean
    input_field_type: 'email' | 'phone' | 'text'
    input_field_label: string
    input_field_placeholder: string
    input_field_required: boolean

    display_delay_seconds: number

    privacy_text: string

    segment_ids: number[]

    promo_code_id?: number | null;

    image: File | null
}

/**
 * Request для создания баннера
 */
export interface CreateOtoBannerRequest {
    name: string
    status: 'active' | 'inactive'
    device_type: 'desktop' | 'mobile'
    title?: string | null
    subtitle?: string | null
    button_enabled?: boolean
    button_text?: string | null
    input_field_enabled?: boolean
    input_field_type?: 'email' | 'phone' | 'text'
    input_field_label?: string | null
    input_field_placeholder?: string | null
    input_field_required?: boolean
    display_delay_seconds?: number
    privacy_text?: string | null
    segment_ids?: number[] | null
    image?: File | null
}

/**
 * Request для обновления баннера
 */
export interface UpdateOtoBannerRequest {
    name?: string
    status?: 'active' | 'inactive'
    device_type?: 'desktop' | 'mobile'
    title?: string | null
    subtitle?: string | null
    button_enabled?: boolean
    button_text?: string | null
    input_field_enabled?: boolean
    input_field_type?: 'email' | 'phone' | 'text'
    input_field_label?: string | null
    input_field_placeholder?: string | null
    input_field_required?: boolean
    display_delay_seconds?: number
    privacy_text?: string | null
    segment_ids?: number[] | null
    image?: File | null
}

/**
 * Параметры поиска/фильтрации
 */
export interface OtoBannerSearchParams {
    page?: number
    per_page?: number
    total?: number
    search?: string
    status?: 'active' | 'inactive'
    device_type?: 'desktop' | 'mobile'
    date_from?: string
    date_to?: string
}

/**
 * Параметры для заявок
 */
export interface OtoBannerSubmissionsParams {
    page?: number
    per_page?: number
    total?: number
    banner_id?: number
    status?: 'new' | 'viewed' | 'processed'
    manager_id?: number
    search?: string
    date_from?: string
    date_to?: string
}