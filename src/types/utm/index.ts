// Типы функционала UTM-меток (Аналитика → Источники заказов).
// См. lara_admin/docs/tasks/utm-tracking.md

export interface MarketingChannel {
    id: number
    name: string
    code: string
    is_system: boolean
    is_active: boolean
    sort: number
    created_at?: string
    updated_at?: string
}

export interface UtmTag {
    id: number
    name: string
    created_at?: string
    updated_at?: string
}

export interface UtmLink {
    id: number
    name: string
    marketing_channel_id: number
    channel?: MarketingChannel | null
    utm_tag_id: number | null
    tag?: UtmTag | null
    target_url: string
    utm_source: string | null
    utm_medium: string | null
    utm_campaign: string | null
    utm_content: string | null
    utm_term: string | null
    slug: string
    is_active: boolean
    tracking_url: string
    target_url_with_params: string
    created_at?: string
    updated_at?: string
}

export interface CreateMarketingChannelRequest {
    name: string
    code: string
    is_active?: boolean
    sort?: number
}

export type UpdateMarketingChannelRequest = Partial<CreateMarketingChannelRequest>

export interface CreateUtmTagRequest {
    name: string
}

export type UpdateUtmTagRequest = Partial<CreateUtmTagRequest>

export interface CreateUtmLinkRequest {
    name: string
    marketing_channel_id: number | null
    utm_tag_id?: number | null
    target_url: string
    utm_source?: string | null
    utm_medium?: string | null
    utm_campaign?: string | null
    utm_content?: string | null
    utm_term?: string | null
    is_active?: boolean
}

export type UpdateUtmLinkRequest = Partial<CreateUtmLinkRequest>

// Строка сводной таблицы аналитики
export interface UtmAnalyticsRow {
    link_id: number
    name: string
    channel: string | null
    channel_id: number
    tag: string | null
    tag_id: number | null
    tracking_url: string
    target_url_with_params: string
    visits: number
    orders: number
    orders_amount: number
    purchases: number
    purchases_amount: number
    clients: number
    cr_order: number
    cr_purchase: number
}

export interface UtmAnalyticsTotals {
    visits: number
    orders: number
    orders_amount: number
    purchases: number
    purchases_amount: number
    clients: number
    cr_order: number
    cr_purchase: number
}

export interface UtmAnalyticsChartSeries {
    link_id: number
    name: string
    data: number[]
}

export interface UtmAnalyticsResponse {
    rows: UtmAnalyticsRow[]
    totals: UtmAnalyticsTotals
    pie: { labels: string[]; data: number[] }
    chart: { labels: string[]; series: UtmAnalyticsChartSeries[]; granularity: string }
    from: string
    to: string
}

export interface UtmAnalyticsFilters {
    from?: string
    to?: string
    preset?: 'all'
    granularity?: 'day' | 'month'
    channel_id?: number | null
    tag_id?: number | null
    link_ids?: number[]
}

export const initialUtmLinkForm: CreateUtmLinkRequest = {
    name: '',
    marketing_channel_id: null,
    utm_tag_id: null,
    target_url: '',
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    is_active: true,
}
