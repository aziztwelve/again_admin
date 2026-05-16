import {Order, OrderSummary} from "@/types/order";

export interface OrderApiResponseUpdate {
    success: boolean;
    order: Order;
    summary: OrderSummary;
}