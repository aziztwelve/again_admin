export class Unit {
    id: number;
    name: string;
    abbreviation: string;
    description: string | null;

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.abbreviation = data.abbreviation;
        this.description = data.description;
    }

    static fromJSON(json: string): Unit {
        const data = JSON.parse(json);
        return new Unit(data);
    }
}
