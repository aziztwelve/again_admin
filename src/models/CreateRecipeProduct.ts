export class CreateRecipeProduct {
    id: number | null;
    parent_product_id?: number | null;
    component_type: 'ProductVariant' | 'Product' | 'Material';
    component_id: number | null;
    component?: any;
    unit_id: number | null;
    variant_id: number | null;
    is_default: number | null;
    qty: number | null;
    variants?: CreateRecipeProduct[]; // Для группировки вариантов

    constructor(data: Partial<CreateRecipeProduct> & { component_type: string }) {
        this.id = data.id ?? null;
        this.parent_product_id = data.parent_product_id ?? null;
        this.component_type = this.extractComponentType(data.component_type);
        this.component_id = data.component_id ?? null;
        this.component = data.component ?? null;
        this.unit_id = data.unit_id ?? null;
        this.variant_id = data.variant_id ?? null;
        this.is_default = data.is_default ?? null;
        this.qty = data.qty ?? null;
        this.variants = data.variants ?? [];
    }

    static fromJSON(json: string): CreateRecipeProduct {
        const data = JSON.parse(json);
        return new CreateRecipeProduct(data);
    }

    toJSON(): Record<string, any> {
        return {
            component_type: this.component_type,
            component_id: this.component_id,
            qty: this.qty,
            is_default: this.is_default,
        };
    }

    private extractComponentType(type: string): 'ProductVariant' | 'Product' | 'Material' {
        const parts = type.split('\\');
        return parts[parts.length - 1] as 'ProductVariant' | 'Product' | 'Material';
    }

    /**
     * Группирует продукты и их варианты (ProductVariant) по родительскому продукту.
     */
    static groupByParent(items: CreateRecipeProduct[]): CreateRecipeProduct[] {
        const products = items.filter(i => i.component_type === 'Product');
        const variants = items.filter(i => i.component_type === 'ProductVariant');

        const result: CreateRecipeProduct[] = [];

        // 1) Для каждого варианта — клонируем родительский продукт и ставим variant_id
        variants.forEach(variant => {
            const parent = products.find(p => p.component_id === variant.parent_product_id);
            if (parent) {
                const cloned = new CreateRecipeProduct(parent);
                cloned.variant_id = variant.component_id;
                result.push(cloned);
            }
        });

        // 2) Добавляем продукты без вариантов
        const usedProductIds = new Set(result.map(r => r.component_id));
        products.forEach(product => {
            if (!usedProductIds.has(product.component_id)) {
                // клонируем сам продукт, variant_id у него останется null
                result.push(new CreateRecipeProduct(product));
            }
        });

        return result;
    }


}
