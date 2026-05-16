import {User} from "@/models/user/User";

export class BatchGet {
    base_batch_number: string | null;
    completed_datetime: string | null;
    notes: string | null;
    performers: User[] | null;
    planned_end_datetime: string | null;
    planned_quantity: number | null;
    planned_start_datetime: string | null;
    started_datetime: string | null;
    status: string | null;

    constructor() {
        this.base_batch_number = null;
        this.completed_datetime = null;
        this.notes = null;
        this.performers = null;
        this.planned_end_datetime = null;
        this.planned_quantity = null;
        this.planned_start_datetime = null;
        this.started_datetime = null;
        this.status = null;
    }

    toJSON(): Record<string, any> {
        return {
            base_batch_number: this.base_batch_number,
            completed_datetime: this.completed_datetime,
            notes: this.notes,
            performers: this.performers,
            planned_end_datetime: this.planned_end_datetime,
            planned_quantity: this.planned_quantity,
            planned_start_datetime: this.planned_start_datetime,
            started_datetime: this.started_datetime,
            status: this.status
        };
    }

    // Optional: You could add a method to create an instance from JSON data
    static fromJSON(data: Record<string, any>): BatchGet {
        const batch = new BatchGet();
        batch.base_batch_number = data.base_batch_number || null;
        batch.completed_datetime = data.completed_datetime || null;
        batch.notes = data.notes || null;
        batch.performers = data.performers || null;
        batch.planned_end_datetime = data.planned_end_datetime || null;
        batch.planned_quantity = data.planned_quantity || null;
        batch.planned_start_datetime = data.planned_start_datetime || null;
        batch.started_datetime = data.started_datetime || null;
        batch.status = data.status || null;
        return batch;
    }
}