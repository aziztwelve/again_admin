export class CreateRecipeCostRate {
    cost_category_id: number;
    rate_per_unit: number | string;
    fixed_rate: number;

    constructor(data: any) {
        this.cost_category_id = data.cost_category_id;
        this.rate_per_unit = data.rate_per_unit;
        this.fixed_rate = data.fixed_rate;
    }

    static fromJSON(json: string): CreateRecipeCostRate {
        const data = JSON.parse(json);
        return new CreateRecipeCostRate(data);
    }


    toJSON(): Record<string, any> {
        return {
            cost_category_id: this.cost_category_id,
            rate_per_unit: this.rate_per_unit,
            fixed_rate: this.fixed_rate,
        };
    }

}