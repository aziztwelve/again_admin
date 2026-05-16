import {Order, OrderUpdateForm} from "@/types/order";

export function orderToFormData(o: Order): OrderUpdateForm {
    return {
        notes: o.notes ?? null,
        status: o.status ?? null,
        payment_status: o.payment_status ?? null,
        created_at: o.created_at ?? null,
        delivery_method_id: o.delivery_method_id ?? null,
    }
}
