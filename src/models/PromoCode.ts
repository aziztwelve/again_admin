import {Product} from "@/models/Product";
import {DiscountTargetType} from "@/constants/DiscountType";

export class PromoCode {
    id: number | undefined;
    code: string | undefined;
    discountAmount: number | undefined;
    discountType: 'percentage' | 'fixed' | undefined;
    // template_type: 'birthday' | 'regular' | undefined;
    template_type: boolean | undefined;
    discount_behavior: 'replace' | 'stack' | 'skip' | undefined;
    startsAt: string | undefined;
    image: File | string | undefined;
    imageUrl: string | undefined;
    description: string | undefined;
    expiresAt: string | undefined;
    maxUses: number | undefined;
    timesUsed: number | undefined;
    isActive: boolean | undefined;
    is_unlimited: boolean | undefined;
    applies_to_all_products: boolean | undefined;
    applies_to_all_clients: boolean | undefined;
    createdAt: string | undefined;
    updatedAt: string | undefined;
    promo_code_type: string | undefined;
    selected_products: Product[] | undefined;

    constructor() {
        this.id = undefined;
        this.code = undefined;
        this.discountAmount = undefined;
        this.discountType = undefined;
        this.template_type = undefined;
        this.startsAt = undefined;
        this.image = undefined;
        this.imageUrl = undefined;
        this.description = undefined;
        this.expiresAt = undefined;
        this.maxUses = undefined;
        this.timesUsed = 0;
        this.isActive = true;
        this.applies_to_all_products = false;
        this.applies_to_all_clients = false;
        this.createdAt = undefined;
        this.updatedAt = undefined;
        this.promo_code_type = undefined;
        this.selected_products = undefined;
        this.discount_behavior = undefined;
        this.is_unlimited = undefined;
    }

    get discountTypeLabel(): string {
        if (this.discountType === 'percentage') {
            return 'Процентная';
        }
        return 'Фиксированная';
    }

    get formattedValue(): string {
        if (this.discountType === 'percentage') {
            return `${this.discountAmount ?? 0}%`;
        }
        return `${(this.discountAmount ?? 0).toFixed(2)}`;
    }

    static fromJSON(json: any): PromoCode {
        const promo = new PromoCode();
        promo.id = json.id;
        promo.code = json.code;
        promo.discountAmount = json.discount_amount ? Number(json.discount_amount) : 0;
        promo.discount_behavior = json.discount_behavior
        promo.discountType = json.discount_type;
        promo.template_type = json.template_type === 'birthday';
        promo.startsAt = json.starts_at ?? undefined;
        promo.image = json.image ? `${process.env.VUE_APP_BASE_URL}/promo-code/getImage?path=${json.image}` : undefined;
        promo.description = json.description ?? undefined;
        promo.expiresAt = json.expires_at ?? undefined;
        promo.maxUses = json.max_uses ?? undefined;
        promo.timesUsed = json.times_used ?? 0;
        promo.isActive = !!json.is_active;
        promo.applies_to_all_products = !!json.applies_to_all_products;
        promo.applies_to_all_clients = !!json.applies_to_all_clients;
        promo.createdAt = json.created_at ?? undefined;
        promo.updatedAt = json.updated_at ?? undefined;
        promo.promo_code_type = json.type;
        promo.selected_products = json.products ?? [];
        promo.is_unlimited = json.is_unlimited ?? undefined;
        return promo;
    }

    toJSON(): any {
        return {
            code: this.code ?? null,
            discount_amount: this.discountAmount ?? null,
            discount_behavior: this.discount_behavior ?? null,
            discount_type: this.discountType ?? null,
            template_type: this.template_type ?? null,
            starts_at: this.startsAt ?? null,
            image: this.image ?? null,
            description: this.description ?? null,
            expires_at: this.expiresAt ?? null,
            max_uses: this.maxUses ?? null,
            times_used: this.timesUsed ?? 0,
            is_active: this.isActive ?? null,
            is_unlimited: this.is_unlimited ?? null,
        };
    }


    toFormData(): FormData {
        const formData = new FormData();

        formData.append('code', this.code ?? '');
        formData.append('discount_amount', String(this.discountAmount ?? ''));
        formData.append('discount_type', this.discountType ?? '');
        formData.append('template_type', this.template_type ? 'birthday' : 'regular');
        formData.append('discount_behavior', this.discount_behavior ?? '');
        formData.append('starts_at', this.startsAt ?? '');
        formData.append('description', this.description ?? '');
        formData.append('expires_at', this.expiresAt ?? '');
        formData.append('max_uses', String(this.maxUses ?? ''));
        formData.append('times_used', String(this.timesUsed ?? 0));
        formData.append('is_active', this.isActive ? '1' : '0');
        formData.append('is_unlimited', this.is_unlimited ? '1' : '0');
        formData.append('applies_to_all_clients', this.applies_to_all_clients ? '1' : '0');


        formData.append('type', String(this.promo_code_type ?? ''))


        if (this.promo_code_type === DiscountTargetType.SPECIFIC && this.selected_products?.length) {
            this.selected_products.forEach((product: Product) => {
                if (product.variants?.length) {
                    product.variants.forEach((variant: Product) => {
                        formData.append(`products_with_variants[${product.id}][]`, String(variant.id));
                    });
                } else {
                    formData.append(`products_with_variants[${product.id}][]`, '');
                }
            });
        }

        if (this.image instanceof File) {
            formData.append('image', this.image, this.image.name);
        } else if (typeof this.image === 'string' && this.image) {

        }

        return formData;
    }


    getImageURL(): string | undefined {
        if (typeof this.image == 'string') {
            const path = encodeURIComponent(this.image);
            return `${process.env.VUE_APP_BASE_URL}/promo-code/getImage?path=${path}`;
        }
        return undefined;
    }


    clone(): PromoCode {
        const cloned = new PromoCode();
        cloned.id = this.id;
        cloned.code = this.code;
        cloned.discountAmount = this.discountAmount;
        cloned.discountType = this.discountType;
        cloned.template_type = this.template_type;
        cloned.discount_behavior = this.discount_behavior;
        cloned.startsAt = this.startsAt;
        cloned.description = this.description;
        cloned.expiresAt = this.expiresAt;
        cloned.maxUses = this.maxUses;
        cloned.timesUsed = this.timesUsed;
        cloned.isActive = this.isActive;
        cloned.is_unlimited = this.is_unlimited;
        cloned.createdAt = this.createdAt;
        cloned.updatedAt = this.updatedAt;
        return cloned;
    }
}
