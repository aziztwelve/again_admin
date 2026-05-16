export interface OrderDeliveryAddress {
    country?: string | null
    region?: string | null
    city?: string | null
    postal_code?: string | null
    address?: string | null
    entrance?: string | null
    floor?: string | null
    intercom?: string | null
    delivery_comment?: string | null
    delivery_date?: string | null
    buyer_comment?: string | null
}

export interface OrderUserInfo {
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
}

export interface OrderDeliveryMethod {
    name?: string | null
}

export interface OrderUpdateForm {
    client_id?: number | null
    user?: OrderUserInfo | null
    delivery_address?: OrderDeliveryAddress | null
    delivery_method?: OrderDeliveryMethod | null
    delivery_method_id?: number | null
    delivery_date?: string | null
    source?: string | null
    status?: string | null
    payment_status?: string | null
    payment_method?: string | null
    notes?: string | null
    created_at?: string | null
    items?: Array<{
        product_id: number
        variant_id?: number | null
        product_variant_id?: number | null
        color_id?: number | null
        quantity: number
        price: number
    }>
    promo_code?: string | null
}
