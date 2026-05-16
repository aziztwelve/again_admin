import { CreateRecipeComponent } from "./CreateRecipeComponent";
import {CreateRecipeProduct} from "@/models/CreateRecipeProduct";

export class CreateRecipe {
    name: string;
    description: string;
    output_unit_id: number;
    instructions: string;
    production_time: number;
    is_active: boolean;
    material_items: CreateRecipeComponent[];
    output_products: CreateRecipeProduct[];

    constructor(data: any) {
        this.name = data.name;
        this.description = data.description;
        this.output_unit_id = data.output_unit_id;
        this.instructions = data.instructions;
        this.production_time = data.production_time;
        this.is_active = data.is_active;
        this.material_items = data.material_items?.map((i: any) => new CreateRecipeComponent(i)) || [];
        this.output_products = (data.output_products || []).map(
            (p: any) => new CreateRecipeProduct(p)
        );
    }

    static fromJSON(json: string): CreateRecipe {
        const data = JSON.parse(json);
        return new CreateRecipe(data);
    }


    toJSON(): Record<string, any> {
        return {
            name: this.name,
            description: this.description,
            output_unit_id: this.output_unit_id,
            instructions: this.instructions,
            production_time: this.production_time,
            is_active: this.is_active,
            material_items: this.material_items.map(item =>
                typeof item.toJSON === 'function' ? item.toJSON() : { ...item }
            ),
            output_products: this.output_products.map(product =>
                typeof product.toJSON === 'function' ? product.toJSON() : { ...product }
            ),
        };
    }
}