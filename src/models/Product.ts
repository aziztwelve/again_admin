export class MarketplaceLinks {
    wb: string | undefined;
    ozon: string | undefined;
    zy: string | undefined;

    constructor() {
        this.wb = ''
        this.ozon = ''
        this.zy = ''
    }

    static fromJSON(json: any): MarketplaceLinks {

        const MPL = new MarketplaceLinks()

        MPL.wb = json.wb
        MPL.ozon = json.ozon
        MPL.zy = json.zy

        return MPL
    }
}

export class Product {
    id: number | null;
    product_id: number | null;
    display_order: number | null;
    absorbency_level: number | null;
    uuid: string | null;
    code: string | null;
    color_id: string | undefined;
    name: string;
    marketplace_links: MarketplaceLinks | undefined;
    description: string;
    type: string | null;
    default_unit_id: string | null;
    unit_id: string | null;
    is_active: boolean | null;
    has_variants: boolean | null;
    allow_preorder: boolean | null;
    after_purchase_processing_time: string | null;
    sku: string;
    price: number | null;
    cost_price: number | null;
    stock_quantity: number | null;
    barcode: string;
    min_order_quantity: number | null;
    max_order_quantity: number | null;
    is_featured: boolean | null;
    is_new?: boolean;
    discount_price: number | null;
    old_price: number | string;
    weight: string;
    length: string;
    width: string;
    height: string;
    images: any[];
    categories: number[] | null;
    options: any[] | null;
    variants: Product[];
    imageFiles: File[] | null;
    colors: any[];
    color: object | undefined;

    constructor() {
        this.id = null;
        this.product_id = null;
        this.display_order = null;
        this.absorbency_level = null;
        this.uuid = null;
        this.code = null;
        this.color_id = undefined;
        this.name = '';
        this.marketplace_links = undefined;
        this.description = '';
        this.type = "simple";
        this.default_unit_id = "1";
        this.unit_id = "1";
        this.is_active = false;
        this.has_variants = false;
        this.allow_preorder = false;
        this.after_purchase_processing_time = "0";
        this.sku = '';
        this.price = 0;
        this.cost_price = 0;
        this.stock_quantity = 0;
        this.barcode = '';
        this.min_order_quantity = 1;
        this.max_order_quantity = 1;
        this.is_featured = false;
        this.is_new = undefined;
        this.discount_price = null;
        this.old_price = '';
        this.weight = "";
        this.length = "";
        this.width = "";
        this.height = "";
        this.images = [];
        this.categories = [1];
        this.options = null;
        this.variants = [];
        this.imageFiles = [];
        this.colors = [];
        this.color = undefined;
    }

    static fromJSON(json: any): Product {
        const product = new Product();
        const uuidGenerate = `variant_generated_${Math.round(Math.random() * 1000)}`;

        product.id = json.id ?? null;
        product.product_id = json.product_id ?? null;
        product.display_order = json.display_order ?? null;
        product.absorbency_level = json.absorbency_level ?? null;
        product.name = json.name ?? null;
        product.marketplace_links = MarketplaceLinks.fromJSON(json.marketplace_links ?? {});
        product.code = json.code ?? null;
        product.description = json.description ?? null;
        product.type = json.type ?? "simple";
        product.default_unit_id = json.default_unit_id ?? "1";
        product.is_active = json.is_active ?? false;
        product.has_variants = json.has_variants ?? false;
        product.allow_preorder = json.allow_preorder ?? false;
        product.after_purchase_processing_time = json.after_purchase_processing_time ?? "0";
        product.sku = json.sku ?? null;
        product.price = json.price ?? 0;
        product.cost_price = json.cost_price ?? 0;
        product.stock_quantity = json.stock_quantity ?? 0;
        product.barcode = json.barcode ?? null;
        product.min_order_quantity = json.min_order_quantity ?? 1;
        product.max_order_quantity = json.max_order_quantity ?? 1;
        product.is_featured = json.is_featured ?? false;
        product.is_new = json.is_new;
        product.discount_price = json.discount_price ?? null;
        product.old_price = json.old_price ?? '';
        product.weight = json.weight ?? "";
        product.length = json.length ?? "";
        product.width = json.width ?? "";
        product.height = json.height ?? "";
        product.images = json.images ?? [];
        product.categories = json.categories ?? [1];
        product.options = json.options ?? null;
        product.uuid = json.uuid ?? uuidGenerate;
        product.color_id = json.color_id ?? json.color?.id ?? undefined;
        product.colors = json.colors ?? [];
        product.color = json.color ?? {};
        product.color = json.color ?? {};
        product.variants = json.variants?.length ? json.variants.map((item: any) => Product.fromJSON({
            ...item,
            product_id: json.id,
        })) : [];
        // product.imageFiles = json.imageFiles ?? [];

        return product;
    }

    static fromJSONForVariantCreate(json: any): Product {
        const product = new Product();

        const uuidGenerate = `variant_generated_${Math.round(Math.random() * 1000)}`;

        product.id = json.id ?? null;
        product.name = json.name ?? null;
        product.uuid = json.uuid ?? uuidGenerate;
        product.barcode = json.barcode ?? null;
        product.cost_price = json.cost_price ?? 0;
        product.price = json.price ?? 0;
        product.type = json.type ?? "simple";
        product.unit_id = json.unit_id ?? '1';
        product.is_active = json.is_active ?? false;
        product.colors = json.colors ?? [];
        // product[`variant_images_generated_${uuidGenerate}`] = json[uuidGenerate];

        return product;
    }


    toJSON(): Record<string, any> {
        return {
            name: this.name,
            description: this.description,
            type: this.type,
            default_unit_id: this.default_unit_id,
            is_active: this.is_active,
            has_variants: this.has_variants,
            allow_preorder: this.allow_preorder,
            after_purchase_processing_time: this.after_purchase_processing_time,
            sku: this.sku,
            price: this.price,
            cost_price: this.cost_price,
            stock_quantity: this.stock_quantity,
            barcode: this.barcode,
            min_order_quantity: this.min_order_quantity,
            max_order_quantity: this.max_order_quantity,
            is_featured: this.is_featured,
            is_new: this.is_new,
            discount_price: this.discount_price,
            weight: this.weight,
            length: this.length,
            width: this.width,
            height: this.height,
            images: this.images,
            categories: this.categories,
            options: this.options,
            variants: this.variants,
            marketplace_links: this.marketplace_links ? {
                wb: this.marketplace_links.wb || null,
                ozon: this.marketplace_links.ozon || null,
                zy: this.marketplace_links.zy || null,
            } : null,
        };
    }

    toJSONForCreate(): Record<string, any> {
        return {
            name: this.name,
            description: this.description || '',
            type: this.type,
            default_unit_id: this.default_unit_id,
            is_active: this.is_active ? 1 : 0,
            has_variants: this.variants.length ? 1 : 0,
            price: this.price,
            cost_price: this.cost_price,
            barcode: this.barcode || '',
            // is_new: this.is_new,
            weight: this.weight,
            length: this.length,
            width: this.width,
            height: this.height,
            colors: this.colors ?? [],
            color_id: this.color_id ?? null,

            marketplace_links: this.marketplace_links ? {
                wb: this.marketplace_links.wb || null,
                ozon: this.marketplace_links.ozon || null,
                zy: this.marketplace_links.zy || null,
            } : null,

            // images: this.images,

            variants: this.variants.length ? this.variants.map((v: Product) => v.toJSONForVariantCreate()) : [],

            // variants: this.variants,
        };
    }

    toJSONForVariantCreate(): Record<string, any> {
        return {
            id: this.id || null,
            local_uuid: this.uuid || null,
            name: this.name || null,
            barcode: this.barcode || null,
            price: this.price,
            cost_price: this.cost_price,
            type: this.type,
            unit_id: this.default_unit_id,
            description: this.description,
            is_active: this.is_active ? 1 : 0,
            colors: this.colors ?? [],
            color_id: this.color_id ?? null,

            // images: this.images,

            // has_variants: this.variants.length ? 1 : 0,
            // is_new: this.is_new,
            // weight: this.weight,
            // length: this.length,
            // width: this.width,
            // height: this.height,
            // colors: this.colors,
            // product_image: this.images,
            // variants: this.variants.length ? this.variants : [],

        };
    }


    deleteProductByUuidToVariants(uuid: string): void {
        if (!this.variants) return;
        this.variants = this.variants.filter(variant => variant.uuid !== uuid);
    }


    clone(): Product {
        const cloned = new Product();

        cloned.id = this.id;
        cloned.uuid = this.uuid;
        cloned.name = this.name;
        cloned.description = this.description;
        cloned.type = this.type;
        cloned.default_unit_id = this.default_unit_id;
        cloned.unit_id = this.unit_id;
        cloned.is_active = this.is_active;
        cloned.has_variants = this.has_variants;
        cloned.allow_preorder = this.allow_preorder;
        cloned.after_purchase_processing_time = this.after_purchase_processing_time;
        cloned.sku = this.sku;
        cloned.price = this.price;
        cloned.cost_price = this.cost_price;
        cloned.stock_quantity = this.stock_quantity;
        cloned.barcode = this.barcode;
        cloned.min_order_quantity = this.min_order_quantity;
        cloned.max_order_quantity = this.max_order_quantity;
        cloned.is_featured = this.is_featured;
        cloned.is_new = this.is_new;
        cloned.discount_price = this.discount_price;
        cloned.old_price = this.old_price;
        cloned.weight = this.weight;
        cloned.length = this.length;
        cloned.width = this.width;
        cloned.height = this.height;

        cloned.images = this.images ? JSON.parse(JSON.stringify(this.images)) : [];
        cloned.categories = this.categories ? [...this.categories] : null;
        cloned.options = this.options ? JSON.parse(JSON.stringify(this.options)) : null;
        cloned.variants = this.variants ? this.variants.map(v => v.clone()) : [];
        cloned.imageFiles = this.imageFiles ? [...this.imageFiles] : null;
        cloned.colors = this.colors ? JSON.parse(JSON.stringify(this.colors)) : [];

        return cloned;
    }


}
