import {MaterialComponent} from "@/models/MaterialComponent";
import {Unit} from "@/models/Unit";

export class RecipeItem {
    id: number;
    recipe_id: number;
    component_type: string;
    component_id: number;
    quantity: string;
    unit_id: number;
    waste_percentage: string;
    sort_order: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    component: MaterialComponent;
    unit: Unit;

    constructor(data: any) {
        this.id = data.id;
        this.recipe_id = data.recipe_id;
        this.component_type = data.component_type;
        this.component_id = data.component_id;
        this.quantity = data.quantity;
        this.unit_id = data.unit_id;
        this.waste_percentage = data.waste_percentage;
        this.sort_order = data.sort_order;
        this.notes = data.notes;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.deleted_at = data.deleted_at;
        this.component = new MaterialComponent(data.component);
        this.unit = new Unit(data.unit);
    }

    static fromJSON(json: string): RecipeItem {
        const data = JSON.parse(json);
        return new RecipeItem(data);
    }
}