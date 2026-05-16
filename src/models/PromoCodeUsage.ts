import {PromoCode} from '@/models/PromoCode';
import {Client} from '@/models/client/Client';
import Order from '@/models/order/Order'; // Предполагаем, что у вас есть модель Order

export class PromoCodeUsage {
    id: number | undefined;
    promo_code_id: number | undefined;
    client_id: number | undefined;
    order_id: number | undefined;
    discount_amount: number | undefined;
    promo_code: PromoCode | undefined;
    client: Client | undefined;
    order: Order | undefined;
    used_at: string | undefined;


    constructor(json: any) {
        this.id = undefined
        this.promo_code_id = undefined
        this.client = undefined
        this.order_id = undefined
        this.discount_amount = undefined
        this.promo_code = undefined
        this.order = undefined
        this.used_at = undefined
        this.client_id = undefined
    }


    static fromJSON(json: any): PromoCodeUsage {
        const PCU = new PromoCodeUsage({})

        PCU.id = json.id
        PCU.promo_code_id = json.promo_code_id
        PCU.client_id = json.client_id
        PCU.order_id = json.order_id
        PCU.discount_amount = json.discount_amount
        PCU.used_at = json.used_at

        PCU.promo_code = json.promo_code ? PromoCode.fromJSON(json.promo_code) : undefined
        PCU.client = json.client ? Client.fromJSON(json.client) : undefined
        PCU.order = json.order ? Order.fromJSON(json.order) : undefined

        return PCU
    }

}