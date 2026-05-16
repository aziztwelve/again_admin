import {Client} from "@/types/client";
import {DiscountType} from "@/types/discount";

export interface OrderSummaryClient extends Client{
    phone: string;
}

export interface OrderSummaryPromoCode {
    code: string;
    discount_type: DiscountType
    discount_amount: number;
}

export interface OrderSummaryDelivery {
    country: string;
    city: string;
    address: string | null;
}

export interface OrderSummary {
    order_id: number;
    order_number: string;
    status: string;
    payment_status: string;

    // Клиент
    client: OrderSummaryClient;

    // Суммы
    subtotal: number;
    discount_amount: number;
    total_amount: number;
    items_count: number;

    // Промокод
    promo_code: OrderSummaryPromoCode | null;

    // Доставка
    delivery: OrderSummaryDelivery;

    // Даты
    created_at: string; // ISO datetime format
    updated_at: string;
    confirmed_at: string | null;
    delivered_at: string | null;
}