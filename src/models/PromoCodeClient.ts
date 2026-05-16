import {PromoCode} from '@/models/PromoCode';
import {Client} from '@/models/client/Client'; // Предполагаем, что у тебя есть такой класс

export class PromoCodeClient {
    id: number | undefined;
    promoCodeId: number | undefined;
    clientId: number | undefined;
    promoCode: PromoCode | undefined;
    client: Client | undefined;
    createdAt: string | undefined;
    updatedAt: string | undefined;

    constructor() {
        this.id = undefined;
        this.promoCodeId = undefined;
        this.clientId = undefined;
        this.promoCode = undefined;
        this.client = undefined;
        this.createdAt = undefined;
        this.updatedAt = undefined;
    }

    static fromJSON(json: any): PromoCodeClient {
        const item = new PromoCodeClient();
        item.id = json.id;
        item.promoCodeId = json.promo_code_id;
        item.clientId = json.client_id;
        item.promoCode = json.promo_code ? PromoCode.fromJSON(json.promo_code) : undefined;
        item.client = json.client ? Client.fromJSON(json.client) : undefined;
        item.createdAt = json.created_at ?? undefined;
        item.updatedAt = json.updated_at ?? undefined;
        return item;
    }

    toJSON(): any {
        return {
            promo_code_id: this.promoCodeId ?? null,
            client_id: this.clientId ?? null,
        };
    }

    toFormData(): FormData {
        const formData = new FormData();
        formData.append('promo_code_id', String(this.promoCodeId ?? ''));
        formData.append('client_id', String(this.clientId ?? ''));
        return formData;
    }

    clone(): PromoCodeClient {
        const cloned = new PromoCodeClient();
        cloned.id = this.id;
        cloned.promoCodeId = this.promoCodeId;
        cloned.clientId = this.clientId;
        cloned.promoCode = this.promoCode ? this.promoCode.clone() : undefined;
        cloned.client = this.client ? this.client.clone() : undefined;
        cloned.createdAt = this.createdAt;
        cloned.updatedAt = this.updatedAt;
        return cloned;
    }
}
