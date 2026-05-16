import {Client} from "@/models/client/Client";
import {User} from "@/types/user";

export default class ContactRequest {
    id: number | undefined;
    client_id: number | null | undefined;
    client: Client | undefined;
    name: string | null | undefined;
    email: string | null | undefined;
    phone: string | null | undefined;
    message: string | null | undefined;
    source: string | null | undefined;
    status: 'new' | 'viewed' | 'processed' | undefined;
    manager_id: number | null | undefined;
    manager: User | undefined
    meta: any | null | undefined;
    ip: string | null | undefined;
    user_agent: string | null | undefined;
    read_at: string | null | undefined;
    created_at: string | undefined;
    updated_at: string | undefined;

    constructor() {
        this.id = undefined;
        this.client_id = null;
        this.client = undefined
        this.name = null;
        this.email = null;
        this.phone = null;
        this.message = null;
        this.source = null;
        this.status = 'new';
        this.meta = null;
        this.ip = null;
        this.user_agent = null;
        this.read_at = null;
        this.created_at = undefined;
        this.updated_at = undefined;
        this.manager_id = undefined;
        this.manager = undefined;
    }

    static fromJSON(json: any): ContactRequest {
        const cr = new ContactRequest();
        cr.id = json.id;
        cr.client_id = json.client_id ?? null;
        cr.client = json.client ? Client.fromJSON(json.client) : undefined;
        cr.name = json.name ?? null;
        cr.email = json.email ?? null;
        cr.phone = json.phone ?? null;
        cr.message = json.message ?? null;
        cr.source = json.source ?? null;
        cr.status = json.status ?? 'new';
        cr.meta = json.meta ?? null;
        cr.ip = json.ip ?? null;
        cr.user_agent = json.user_agent ?? null;
        cr.read_at = json.read_at ?? null;
        cr.created_at = json.created_at;
        cr.updated_at = json.updated_at;
        cr.manager_id = json.manager_id;
        cr.manager = json.manager;
        return cr;
    }

    toJSONForUpdate() {
        return {
            status: this.status,
            // read_at: this.read_at,
            // message: this.message,
            // source: this.source,
            // Можно добавить другие поля, если надо
        }
    }
}
