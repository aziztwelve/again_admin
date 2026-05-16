import {Product} from "@/models/Product";
import {ReviewAttribute} from "@/models/ReviewAttribute";
import {Client} from "@/models/client/Client";



export class Review {
    id: number | undefined;
    client_id: number | undefined;
    reviewable_type: string | undefined;
    reviewable_id: number | undefined;
    attributes: ReviewAttribute[];
    client: Client | undefined;
    client_email: string | null | undefined;
    client_name: string | null | undefined;
    content: string | undefined;
    created_at: string | undefined;
    deleted_at: string | null | undefined;
    images: any[]; // Update type when image structure is known
    is_published: boolean | undefined;
    is_spam: number | undefined;
    is_verified: boolean | undefined;
    published_at: string | null | undefined;
    rating: number | undefined;
    responses: any[]; // Update type when response structure is known
    reviewable: Product | undefined;
    status: string | undefined;
    updated_at: string | undefined;

    constructor() {
        this.id = undefined;
        this.client_id = undefined;
        this.reviewable_type = undefined;
        this.reviewable_id = undefined;
        this.attributes = [];
        this.client = undefined;
        this.client_email = undefined;
        this.client_name = undefined;
        this.content = undefined;
        this.created_at = undefined;
        this.deleted_at = undefined;
        this.images = [];
        this.is_published = undefined;
        this.is_spam = undefined;
        this.is_verified = undefined;
        this.published_at = undefined;
        this.rating = undefined;
        this.responses = [];
        this.reviewable = undefined;
        this.status = undefined;
        this.updated_at = undefined;
    }

    static fromJSON(json: any): Review {
        const review = new Review();
        review.id = json.id;
        review.client_id = json.client_id;
        review.reviewable_type = json.reviewable_type;
        review.reviewable_id = json.reviewable_id;
        review.attributes = json.attributes
            ? json.attributes.map((attr: any) => ReviewAttribute.fromJSON(attr))
            : [];
        review.client = json.client ? Client.fromJSON(json.client) : undefined;
        review.client_email = json.client_email ?? null;
        review.client_name = json.client_name ?? null;
        review.content = json.content;
        review.created_at = json.created_at;
        review.deleted_at = json.deleted_at ?? null;
        review.images = json.images ?? [];
        review.is_published = json.is_published;
        review.is_spam = json.is_spam;
        review.is_verified = json.is_verified;
        review.published_at = json.published_at ?? null;
        review.rating = json.rating;
        review.responses = json.responses ?? [];
        review.reviewable = json.reviewable ? Product.fromJSON(json.reviewable) : undefined;
        review.status = json.status;
        review.updated_at = json.updated_at;

        return review;
    }

    toJSON(): any {
        return {
            id: this.id ?? null,
            client_id: this.client_id ?? null,
            reviewable_type: this.reviewable_type ?? null,
            reviewable_id: this.reviewable_id ?? null,
            attributes: this.attributes.map(attr => attr.toJSON()),
            client: this.client ? this.client.toJSON() : null,
            client_email: this.client_email ?? null,
            client_name: this.client_name ?? null,
            content: this.content ?? null,
            created_at: this.created_at ?? null,
            deleted_at: this.deleted_at ?? null,
            images: this.images ?? [],
            is_published: this.is_published ?? null,
            is_spam: this.is_spam ?? null,
            is_verified: this.is_verified ?? null,
            published_at: this.published_at ?? null,
            rating: this.rating ?? null,
            responses: this.responses ?? [],
            reviewable: this.reviewable ? this.reviewable.toJSON() : null,
            status: this.status ?? null,
            updated_at: this.updated_at ?? null,
        };
    }
}
