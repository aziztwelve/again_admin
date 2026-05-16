export class CreateRecipeComponent {
    component_type: 'ProductVariant' | 'Product' | 'Material';
    component_id: number;
    quantity: number;
    unit_id: number;

    constructor(data: any) {
        this.component_type = 'Product';
        this.component_id = data.component_id;
        this.quantity = data.quantity;
        this.unit_id = data.unit_id;
    }

    static fromJSON(json: any): CreateRecipeComponent {
        const data = new CreateRecipeComponent({});
        data.component_id = json.component_id
        data.component_type = json.component_type
        data.quantity = json.quantity
        data.unit_id = json.unit_id
        return data
    }

    toJSON(): Record<string, any> {
        return {
            component_type: this.component_type,
            component_id: this.component_id,
            quantity: this.quantity,
            unit_id: this.unit_id,
        };
    }

}