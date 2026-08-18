/**
 * Типы правил бесплатной доставки.
 * Спека: lara_admin/docs/tasks/free-shipping.md
 */

export interface FreeShippingOption {
    code: string
    label: string
}

export interface FreeShippingNamedItem {
    id: number
    name: string
}

export interface FreeShippingCountryOption extends FreeShippingNamedItem {
    code?: string | null
}

export interface FreeShippingRegionOption extends FreeShippingNamedItem {
    country_id: number
}

export interface FreeShippingProductOption extends FreeShippingNamedItem {
    price?: number
}

export interface FreeShippingRule {
    id: number
    name: string
    is_active: boolean
    priority: number
    min_order_amount: number
    services: string[]
    services_labels: string[]
    delivery_types: string[]
    delivery_types_labels: string[]
    payment_methods: string[]
    payment_methods_labels: string[]
    product_ids: number[]
    products: FreeShippingNamedItem[]
    country_ids: number[]
    countries: FreeShippingNamedItem[]
    region_ids: number[]
    regions: FreeShippingNamedItem[]
    starts_at: string | null
    ends_at: string | null
    created_at?: string | null
}

/** Payload формы (создание/редактирование). */
export interface FreeShippingRuleForm {
    id?: number
    name: string
    is_active: boolean
    priority: number
    min_order_amount: number | null
    services: string[]
    delivery_types: string[]
    payment_methods: string[]
    product_ids: number[]
    country_ids: number[]
    region_ids: number[]
    starts_at: string | null
    ends_at: string | null
}

export interface FreeShippingOptions {
    services: FreeShippingOption[]
    delivery_types: FreeShippingOption[]
    payment_methods: FreeShippingOption[]
    countries: FreeShippingCountryOption[]
    regions: FreeShippingRegionOption[]
}

export interface FreeShippingRuleListResponse {
    success: boolean
    data: FreeShippingRule[]
    meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
    }
}

export const createEmptyRuleForm = (): FreeShippingRuleForm => ({
    name: '',
    is_active: true,
    priority: 0,
    min_order_amount: null,
    services: [],
    delivery_types: [],
    payment_methods: [],
    product_ids: [],
    country_ids: [],
    region_ids: [],
    starts_at: null,
    ends_at: null,
})

export const ruleToForm = (rule: FreeShippingRule): FreeShippingRuleForm => ({
    id: rule.id,
    name: rule.name,
    is_active: rule.is_active,
    priority: rule.priority,
    min_order_amount: rule.min_order_amount,
    services: [...(rule.services ?? [])],
    delivery_types: [...(rule.delivery_types ?? [])],
    payment_methods: [...(rule.payment_methods ?? [])],
    product_ids: [...(rule.product_ids ?? [])],
    country_ids: [...(rule.country_ids ?? [])],
    region_ids: [...(rule.region_ids ?? [])],
    starts_at: rule.starts_at,
    ends_at: rule.ends_at,
})
