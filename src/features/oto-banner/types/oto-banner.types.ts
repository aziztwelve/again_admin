/**
 * Основная модель OTO баннера
 */
export interface OtoBanner {
    id: number
    name: string
    status: 'active' | 'inactive'
    status_label: string
    device_type: 'desktop' | 'mobile'
    device_type_label: string

    title: string | null
    subtitle: string | null

    button_enabled: boolean
    button_text: string | null

    input_field_enabled: boolean
    input_field_type: 'email' | 'phone' | 'text'
    input_field_type_label: string
    input_field_label: string | null
    input_field_placeholder: string | null
    input_field_required: boolean

    display_delay_seconds: number

    privacy_text: string | null

    segment_ids: number[] | null

    image: {
        id: number
        url: string
        path: string
    } | null

    views_count?: number
    submissions_count?: number
    conversion_rate?: number

    is_active: boolean


    promo_code_id?: number | null;
    promo_code?: {
        id: number;
        code: string;
        discount_amount: number;
        discount_type: 'percentage' | 'fixed';
        description?: string;
    } | null;

    created_at: string
    updated_at: string
}

/**
 * Краткая модель для списка
 */
export interface OtoBannerListItem {
    id: number
    name: string
    status: 'active' | 'inactive'
    status_label: string
    device_type: 'desktop' | 'mobile'
    device_type_label: string
    title: string | null
    subtitle: string | null
    button_text: string | null
    input_field_label: string | null
    display_delay_seconds: number
    image: {
        url: string
    } | null
    views_count: number
    submissions_count: number
    conversion_rate: number
    created_at: string
}

/**
 * Заявка по баннеру
 */
export interface OtoBannerSubmission {
    id: number
    banner: {
        id: number
        name: string
    } | null
    client: {
        id: number
        name: string | null
        email: string | null
        phone: string | null
    } | null
    manager: {
        id: number
        name: string | null
    } | null
    name: string | null
    email: string | null
    phone: string | null
    message: string | null
    source: string
    status: 'new' | 'viewed' | 'processed'
    meta: Record<string, any> | null
    ip: string | null
    user_agent: string | null
    read_at: string | null
    created_at: string
    updated_at: string
}

/**
 * Аналитика баннера
 */
export interface OtoBannerAnalytics {
    banner_id: number
    banner_name: string
    views: number
    submissions: number
    conversion_rate: number
    orders_count: number
    total_orders_amount: number
    conversion_percentage?: number
}

/**
 * Сводная аналитика
 */
export interface OtoBannerSummaryAnalytics {
    summary: {
        total_banners: number
        total_views: number
        total_submissions: number
        total_orders: number
        total_orders_amount: number
        average_conversion_rate: number
    }
    banners: OtoBannerAnalytics[]
}

/**
 * График
 */
export interface OtoBannerChartData {
    banner_id: number
    banner_name: string
    period: 'hour' | 'day' | 'month'
    chart: {
        period: string
        views: number
        submissions: number
    }[]
}