import {OrderStatus, PaymentStatus} from "@/types/order";

export interface Order {
    id: string;
    order_number: string;

    // Клиент/Лид
    client_id: number | null;
    lead_id: number | null;

    // Статусы
    status: OrderStatus;
    payment_status: PaymentStatus;

    // Суммы
    total_amount: string | number;
    total_amount_original: string | number | null;
    discount_amount: string | number;
    total_promo_discount: string | number | null;
    total_items_discount: string | number | null;

    // Оплата
    payment_method: string | null;
    payment_provider: string | null;
    payment_id: string | null;
    paid_at: string | null; // ISO datetime

    // Доставка
    delivery_method_id: number | null;
    delivery_zone_id: number | null;
    delivery_address: Record<string, any> | null; // или отдельный интерфейс
    delivery_cost: string | number;
    delivery_data: Record<string, any> | null;
    delivery_comment: string | null;
    delivery_target_id: number | null;
    delivery_date: string | null; // ISO datetime

    // UTM и источники
    source: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;

    // Доп. информация
    ip_address: string | null;
    user_agent: string | null;
    notes: string | null;

    // Временные метки
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    deleted_at: string | null; // ISO datetime

    // Промокод
    promo_code_id: number | null;
}
