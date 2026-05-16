import {Client} from "@/models/client/Client";
import {Product} from "@/models/Product";

interface DeliveryMethod {
    id?: number | null;
    name: string;
    description: string;
    type: string | null;
}


interface OrderItem {
    id: number;
    product: Product;
}

export default class Order {
    id: number | undefined;
    final_amount: number | undefined;
    order_number: string | undefined;
    client_id: number | null | undefined;
    client: Client | undefined;
    created_at: string | undefined;
    delivery_date: string | null | undefined;
    delivery_method: DeliveryMethod | undefined;
    delivery_method_id: number | null | undefined;
    delivery_address: Record<string, any> | null | undefined;
    delivery_target: any;
    delivery_target_id: number | undefined;
    discount_amount: string | undefined;
    total_amount_original: string | undefined;
    total_promo_discount: string | undefined;
    total_items_discount: string | undefined;
    is_paid: boolean | undefined;
    items: OrderItem[] | undefined;
    items_count: number | undefined;
    payment_status: string | undefined;
    payment_method: string | null | undefined;
    source: string | null | undefined;
    status: string | undefined;
    total_amount: string | undefined;
    notes: string | undefined;
    promo_code: any;

    constructor() {
        this.id = undefined;
        this.final_amount = undefined;
        this.order_number = undefined;
        this.client_id = null;
        this.client = undefined;
        this.created_at = undefined;
        this.delivery_date = undefined;
        this.delivery_method = undefined;
        this.delivery_method_id = undefined;
        this.delivery_address = null;
        this.delivery_target = undefined;
        this.delivery_target_id = undefined;
        this.discount_amount = undefined;
        this.total_amount_original = undefined;
        this.total_promo_discount = undefined;
        this.total_items_discount = undefined;
        this.is_paid = undefined;
        this.items = undefined;
        this.items_count = undefined;
        this.payment_status = undefined;
        this.payment_method = null;
        this.source = null;
        this.status = undefined;
        this.total_amount = undefined;
        this.notes = undefined;
        this.promo_code = null;
    }

    static fromJSON(json: any): Order {
        const order = new Order();
        order.id = json.id;
        order.final_amount = json.final_amount;
        order.order_number = json.order_number;
        order.client_id = json.client_id ?? json.client?.id ?? null;
        order.client = json.client || {id: 0, full_name: "", email: "", phone: ""};
        order.created_at = json.created_at;
        order.delivery_date = json.delivery_date ?? json.address?.delivery_date ?? null;
        order.delivery_method = json.delivery_method || {id: null, name: "", description: "", type: null};
        order.delivery_method_id = json.delivery_method_id ?? json.delivery_method?.id ?? null;
        order.delivery_address = json.delivery_address ?? json.address ?? null;
        order.delivery_target = json.delivery_target ?? null;
        order.delivery_target_id = json.delivery_target_id ?? json.delivery_target?.id;
        order.discount_amount = json.discount_amount || 0;
        order.total_amount_original = json.total_amount_original || 0;
        order.total_promo_discount = json.total_promo_discount || 0;
        order.total_items_discount = json.total_items_discount || 0;
        order.is_paid = !!json.is_paid;
        order.items = json.items || [];
        order.items_count = json.items_count || json.summary?.items_count || (Array.isArray(json.items) ? json.items.reduce((sum: number, item: any) => sum + Number(item?.quantity ?? 0), 0) : 0);
        order.payment_status = json.payment_status || "pending";
        order.payment_method = json.payment_method ?? null;
        order.source = json.source ?? null;
        order.status = json.status || "new";
        order.total_amount = json.total_amount || 0;
        order.notes = json.notes || "";
        order.promo_code = json.promo_code ?? null;
        return order;
    }


    toJSONForUpdate() {
        return {
            // id: this.id,
            status: this.status,
            payment_status: this.payment_status,
            created_at: this.created_at,
            delivery_method_id: this.delivery_method_id,
            notes: this.notes
        }
    }

}
