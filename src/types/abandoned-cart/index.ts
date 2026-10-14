// Типы раздела «Брошенные корзины» (Аналитика → Брошенные корзины).
// Бэкенд: GET /carts (список), GET /carts/analytics (метрики).
// См. lara_admin/docs/tasks/abandoned-cart.md

export type CartStatus = 'abandoned' | 'ordered' | null

// ---------- Аналитика ----------

export interface AbandonedCartConversion {
    ordered: number
    abandoned: number
    total: number
    rate: number // %
}

export interface AbandonedCartEmailConversion {
    labels: string[]
    sent: number[]
    ordered: number[]
    rates: number[]
}

export interface AbandonedCartChart {
    labels: string[]
    abandoned: number[]
    abandoned_amount: number[]
    ordered: number[]
    ordered_amount: number[]
    granularity: 'day' | 'month'
    from: string
    to: string
}

export interface AbandonedCartTopProduct {
    name: string
    total_quantity: number
}

export interface AbandonedCartAnalytics {
    // Карточки-метрики
    average_cart_value: number // Средняя стоимость корзины (по брошенным)
    lost_revenue: number       // Упущенный доход
    abandoned_count: number    // Незаказанные брошенные корзины

    // Круговая «Конверсия в заказ»
    conversion: AbandonedCartConversion

    // Конверсия отправленных писем по шагам цепочки.
    email_conversion: AbandonedCartEmailConversion

    // Динамика по дням/месяцам
    chart: AbandonedCartChart

    // Сводные показатели
    total_carts: number
    abandoned_carts: number
    ordered_carts: number
    total_revenue: number
    total_discount: number
    lost_discount: number
    average_order_value: number
    average_discount: number
    total_items_qty: number
    top_products: AbandonedCartTopProduct[]

    period: { from: string; to: string }
}

// ---------- Список корзин ----------

export interface AbandonedCartCustomer {
    name: string | null
    phone: string | null
    email: string | null
}

export interface AbandonedCartCommunication {
    channel: string       // email | telegram | whatsapp | vk | none
    type: string          // trigger
    status: string        // queued | sent | failed
    sent_at: string | null
}

export interface AbandonedCartRow {
    id: number
    status: CartStatus
    total: number
    positions_count: number
    items_qty: number
    versions_count: number
    created_at: string | null
    updated_at: string | null
    ordered_at: string | null
    abandoned_at: string | null
    customer: AbandonedCartCustomer
    last_communication: AbandonedCartCommunication | null
    email_conversion: string | null
}

// Стандартный пагинатор Laravel
export interface Paginated<T> {
    current_page: number
    data: T[]
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
}

// ---------- Фильтры ----------

export type PeriodPreset = '7d' | '30d' | '3m' | '6m' | '12m' | 'custom'

export interface AbandonedCartAnalyticsFilters {
    date_from?: string
    date_to?: string
    granularity?: 'day' | 'month'
}

export interface AbandonedCartListFilters {
    status?: CartStatus | ''
    date_from?: string
    date_to?: string
    search?: string
    per_page?: number
    page?: number
}
