export class ReviewAttribute {
    id: number | undefined;
    review_id: number | undefined;
    name: string | undefined;
    rating: number | undefined;
    created_at: string | undefined;
    updated_at: string | undefined;

    constructor() {
        this.id = undefined;
        this.review_id = undefined;
        this.name = undefined;
        this.rating = undefined;
        this.created_at = undefined;
        this.updated_at = undefined;
    }

    static fromJSON(json: any): ReviewAttribute {
        const attr = new ReviewAttribute();
        attr.id = json.id;
        attr.review_id = json.review_id;
        attr.name = json.name;
        attr.rating = json.rating;
        attr.created_at = json.created_at;
        attr.updated_at = json.updated_at;
        return attr;
    }

    toJSON(): any {
        return {
            id: this.id || null,
            review_id: this.review_id || null,
            name: this.name || null,
            rating: this.rating || null,
            created_at: this.created_at || null,
            updated_at: this.updated_at || null,
        };
    }
}
