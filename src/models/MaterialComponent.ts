import {InventoryBalance} from "@/models/InventoryBalance";

export class MaterialComponent {
    id: number;
    title: string;
    unit_id: number;
    created_at: string;
    updated_at: string;
    inventory_balance: InventoryBalance;

    constructor(data: any) {
        this.id = data.id;
        this.title = data.title;
        this.unit_id = data.unit_id;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.inventory_balance = new InventoryBalance(data.inventory_balance);
    }

    static fromJSON(json: string): MaterialComponent {
        const data = JSON.parse(json);
        return new MaterialComponent(data);
    }
}
