// Класс для инвентарного баланса
export class InventoryBalance {
    id: number;
    item_type: string;
    item_id: number;
    total_quantity: string;
    average_price: string;
    unit_id: number;
    created_at: string;
    updated_at: string;

    constructor(data: any) {
        this.id = data.id;
        this.item_type = data.item_type;
        this.item_id = data.item_id;
        this.total_quantity = data.total_quantity;
        this.average_price = data.average_price;
        this.unit_id = data.unit_id;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static fromJSON(json: string): InventoryBalance {
        const data = JSON.parse(json);
        return new InventoryBalance(data);
    }
}