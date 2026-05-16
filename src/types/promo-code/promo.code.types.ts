import {DiscountType} from "@/types/discount";
import {PromoCodeDiscountBehavior, PromoCodeTemplateType, PromoCodeType} from "@/types/promo-code";


export interface PromoCode {
    id: number;
    code: string;
    image: string | null;
    image_url: string | null; // accessor
    description: string | null;
    discount_amount: number;
    discount_type: DiscountType;
    discount_behavior: PromoCodeDiscountBehavior;

    starts_at: string; // ISO datetime
    expires_at: string; // ISO datetime

    max_uses: number | null;
    times_uses: number;

    is_active: boolean;
    applies_to_all_products: boolean;
    applies_to_all_clients: boolean;

    type: PromoCodeType;
    template_type: PromoCodeTemplateType | null;

    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

