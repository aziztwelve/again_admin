import {Product} from "@/models/Product";
import {CustomerType, DiscountTargetLabels, DiscountTargetType} from "@/constants/DiscountType";

export class Discount {
    id: number | undefined;
    name: string | undefined;
    type: string | undefined;
    value: number | undefined;
    isActive: boolean | undefined;
    customerType: CustomerType | undefined;
    startsAt: string | undefined;
    endsAt: string | null | undefined;
    priority: number | undefined;
    conditions: Record<string, any> | null | undefined;
    discountType: string | undefined;
    createdAt: string | undefined;
    updatedAt: string | undefined;
    is_unlimited?: boolean;

    productIds: number[] | undefined;
    categoryIds: number[] | undefined;

    products: Product[] | null | undefined;

    constructor() {
        this.id = undefined;
        this.name = undefined;
        this.type = undefined;
        this.value = undefined;
        this.isActive = undefined;
        this.customerType = CustomerType.ALL;
        this.startsAt = undefined;
        this.endsAt = undefined;
        this.priority = undefined;
        this.conditions = null;
        this.discountType = undefined;
        this.discountType = undefined;

        this.categoryIds = undefined
        this.productIds = undefined
        this.createdAt = undefined;
        this.updatedAt = undefined;

        this.products = null;
    }


    get typeLabel(): string {
        if (this.type === 'percentage') {
            return 'Процентная';
        }
        return 'Фиксированная';
    }

    get formattedValue(): string {
        if (this.type === 'percentage') {
            return `${this.value ?? 0}%`;
        }
        return `${(this.value ?? 0).toFixed(2)}`;
    }


    get discountTypeLabel(): string {
        return DiscountTargetLabels[this.discountType as DiscountTargetType] ?? this.discountType ?? '';
    }


    static fromJSON(json: any): Discount {
        const discount = new Discount();
        discount.id = json.id;
        discount.name = json.name;
        discount.type = json.type;
        discount.value = json.value ? Number(json.value) : 0;
        discount.isActive = !!json.is_active;
        discount.customerType = json.customer_type ?? CustomerType.ALL;
        discount.startsAt = json.starts_at ?? undefined;
        discount.endsAt = json.ends_at ?? undefined;
        discount.is_unlimited = json.ends_at === null;
        discount.priority = json.priority;
        discount.conditions = json.conditions ?? null;
        discount.discountType = json.discount_type;
        discount.createdAt = json.created_at;
        discount.updatedAt = json.updated_at;
        discount.categoryIds = undefined;
        discount.productIds = json.products ? json.products?.map((item: any) => item.id) : undefined;

        discount.categoryIds = json.categories?.map((item: any) => item.id);
        discount.products = json.products ? json.products.map((p: any) => Product.fromJSON(p)) : null;

        return discount;
    }

    toJSON(): any {
        return {
            name: this.name ?? null,
            type: this.type ?? null,
            discount_type: this.discountType ?? null,
            starts_at: this.startsAt ?? null,
            ends_at: this.endsAt ?? null,
            priority: this.priority ?? null,
            is_active: this.isActive ?? null,
            customer_type: this.customerType ?? CustomerType.ALL,
            value: this.value ?? null,
            categories: this.categoryIds ?? null,
            products: this.productIds ?? null,
            is_unlimited: this.is_unlimited ?? null,
        };
    }


    clone(): Discount {
        const cloned = new Discount();

        cloned.id = this.id;
        cloned.name = this.name;
        cloned.type = this.type;
        cloned.value = this.value;
        cloned.isActive = this.isActive;
        cloned.customerType = this.customerType;
        cloned.startsAt = this.startsAt;
        cloned.endsAt = this.endsAt;
        cloned.priority = this.priority;
        cloned.conditions = this.conditions ? JSON.parse(JSON.stringify(this.conditions)) : null;
        cloned.discountType = this.discountType;
        cloned.is_unlimited = this.is_unlimited;
        cloned.createdAt = this.createdAt;
        cloned.updatedAt = this.updatedAt;

        cloned.productIds = this.productIds ? [...this.productIds] : undefined;
        cloned.categoryIds = this.categoryIds ? [...this.categoryIds] : undefined;

        cloned.products = this.products ? this.products.map(p => p.clone()) : null;

        return cloned;
    }


}
