// Типы для атрибутов
export interface ProductAttributes {
    absorbency_level?: number
    fit_type?: 'low' | 'tall' | null
    weight?: number
    length?: number
    width?: number
    height?: number
    is_new?: boolean
}

// Тип для bulk обновления
export interface BulkUpdateAttributesPayload {
    product_ids: number[]
    attributes: ProductAttributes
}

// Тип ответа от сервера
export interface ApiResponse {
    success: boolean
    message: string
    data?: any
}