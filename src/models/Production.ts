import {Recipe} from "@/models/Recipe";

export class User {
    id: number;
    name: string;

    constructor(data: Partial<User> = {}) {
        this.id = data.id || 0;
        this.name = data.name || '';
    }

    toJSON(): Record<string, any> {
        return {
            id: this.id,
            name: this.name
        };
    }

    static fromAPI(data: Record<string, any>): User {
        return new User({
            id: data.id,
            name: data.name
        });
    }
}

export class ProductVariant {
    product: string;

    constructor(data: Partial<ProductVariant> = {}) {
        this.product = data.product || '';
    }

    toJSON(): Record<string, any> {
        return {
            product: this.product
        };
    }

    static fromAPI(data: Record<string, any>): ProductVariant {
        return new ProductVariant({
            product: data.product
        });
    }
}

export class Production {
    id: number;
    recipe: Recipe;
    createdBy: User;
    createdAt: Date;

    constructor(data: Partial<Production> = {}) {
        this.id = data.id || 0;
        this.recipe = data.recipe ? new Recipe(data.recipe) : new Recipe();
        this.createdBy = data.createdBy ? new User(data.createdBy) : new User();
        this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    }

    toJSON(): Record<string, any> {
        return {
            id: this.id,
            recipe: this.recipe.toJSON(),
            created_by: this.createdBy.toJSON(),
            created_at: this.createdAt.toISOString()
        };
    }

    static fromAPI(data: Record<string, any>): Production {
        return new Production({
            id: data.id,
            recipe: Recipe.fromAPI(data.recipe),
            createdBy: User.fromAPI(data.created_by),
            createdAt: data.created_at
        });
    }
}