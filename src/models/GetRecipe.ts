import {Product} from "./Product";
import { RecipeItem } from "./RecipeItem";
import {User} from "@/models/user/User";
import {ProductVariant} from "@/models/Production";
import {Unit} from "@/models/Unit";

export class GetRecipe {
    id: number;
    name: string;
    description: string;
    output_quantity: string;
    output_unit_id: number;
    is_active: boolean;
    instructions: string;
    production_time: number;
    created_by: User;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    products: Product[];
    selected_variants: ProductVariant[];
    items: RecipeItem[];
    output_unit: Unit;
    cost_rates: any[];

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.output_quantity = data.output_quantity;
        this.output_unit_id = data.output_unit_id;
        this.is_active = data.is_active;
        this.instructions = data.instructions;
        this.production_time = data.production_time;
        this.created_by = new User(data.created_by);
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.deleted_at = data.deleted_at;
        this.products = data.products?.map((p: any) => new Product()) || [];
        this.selected_variants = data.selected_variants?.map((v: any) => new ProductVariant(v)) || [];
        this.items = data.items?.map((i: any) => new RecipeItem(i)) || [];
        this.output_unit = new Unit(data.output_unit);
        this.cost_rates = data.cost_rates || [];
    }

    static fromJSON(json: string): GetRecipe {
        const data = JSON.parse(json);
        return new GetRecipe(data);
    }
}
