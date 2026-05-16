export class Category {
    id: number | undefined;
    name: string | undefined;
    slug: string | undefined;
    description: string | undefined;
    depth: number | undefined;
    parentId: number | undefined;
    productIds: number[];
    children: Category[];

    constructor() {
        this.id = undefined;
        this.name = undefined;
        this.slug = undefined;
        this.description = undefined;
        this.depth = undefined;
        this.parentId = undefined;
        this.productIds = [];
        this.children = [];
    }

    static fromJSON(json: any): Category {
        const category = new Category();
        category.id = json.id;
        category.name = json.name;
        category.slug = json.slug;
        category.description = json.description ?? undefined;
        category.depth = json.depth ?? undefined;
        category.children = json.children
            ? json.children.map((child: any) => Category.fromJSON(child))
            : [];

        category.parentId = json.parent_id;
        category.productIds = json.product_ids;
        return category;
    }

    toJSON(): any {
        return {
            // id: this.id || null,
            name: this.name || null,
            description: this.description || null,
            parent_id: this.parentId || null,
            product_ids: this.productIds || null,
        }
    }

}
