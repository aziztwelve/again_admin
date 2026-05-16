import {User} from "@/models/user/User";
import {UserProfile} from "@/models/user/Profile";

export class Client {
    id: number;
    user_id: number | null;
    client_level_id: number | null;
    bonus_balance: string;
    created_at: string;
    deleted_at: string | null;
    updated_at: string;
    user: User | null;
    profile: UserProfile | null;
    email: string | undefined;
    name: string | undefined;

    constructor(data: Partial<Client> = {}) {
        this.id = this.validateNumber(data.id, 'id') ?? 0;
        this.user_id = this.validateNullableNumber(data.user_id, 'user_id');
        this.client_level_id = this.validateNullableNumber(data.client_level_id, 'client_level_id');
        this.bonus_balance = this.validateString(data.bonus_balance, 'bonus_balance') ?? '0';
        this.created_at = this.validateString(data.created_at, 'created_at') ?? new Date().toISOString();
        this.deleted_at = this.validateNullableString(data.deleted_at, 'deleted_at');
        this.updated_at = this.validateString(data.updated_at, 'updated_at') ?? new Date().toISOString();
        this.user = data.user ? (data.user instanceof User ? data.user : User.fromJSON(data.user)) : null;
        this.profile = data.profile ? (data.profile instanceof UserProfile ? data.profile : UserProfile.fromJSON(data.profile)) : null;
        this.email = data.email ?? undefined;
        this.name = data.name ?? undefined;
    }

    private validateNumber(value: any, fieldName: string): number | undefined {
        if (value === undefined || value === null) return undefined;
        const num = Number(value);
        if (isNaN(num)) throw new Error(`Invalid number value for field ${fieldName}`);
        return num;
    }

    private validateNullableNumber(value: any, fieldName: string): number | null {
        if (value === undefined || value === null) return null;
        return this.validateNumber(value, fieldName) ?? null;
    }

    private validateString(value: any, fieldName: string): string | undefined {
        if (value === undefined || value === null) return undefined;
        if (typeof value !== 'string') throw new Error(`Invalid string value for field ${fieldName}`);
        return value;
    }

    private validateNullableString(value: any, fieldName: string): string | null {
        if (value === undefined || value === null) return null;
        return this.validateString(value, fieldName) ?? null;
    }

    static fromJSON(json: any): Client {
        try {
            return new Client({
                id: json.id,
                user_id: json.user_id,
                client_level_id: json.client_level_id,
                bonus_balance: json.bonus_balance,
                created_at: json.created_at,
                deleted_at: json.deleted_at,
                updated_at: json.updated_at,
                user: json.user,
                profile: json.profile,
                email: json.email,
                name:  json.profile?.first_name || json.profile?.last_name ? `${json.profile?.first_name ?? ''} ${json.profile?.last_name ?? ''}` : json.name ?? undefined,
            });
        } catch (error) {
            console.error('Failed to parse Client from JSON:', error);
            throw new Error('Invalid Client data');
        }
    }

    toJSON(): Record<string, any> {
        return {
            id: this.id,
            user_id: this.user_id,
            client_level_id: this.client_level_id,
            bonus_balance: this.bonus_balance,
            created_at: this.created_at,
            deleted_at: this.deleted_at,
            updated_at: this.updated_at,
            user: this.user?.toJSON?.() ?? null,
            profile: this.profile?.toJSON?.() ?? null
        };
    }


    clone(): Client {
        return new Client({
            id: this.id,
            user_id: this.user_id,
            client_level_id: this.client_level_id,
            bonus_balance: this.bonus_balance,
            created_at: this.created_at,
            deleted_at: this.deleted_at,
            updated_at: this.updated_at,
            user: this.user ? this.user : null,
            profile: this.profile ? this.profile : null,
            email: this.email,
            name: this.name
        });
    }


    get isActive(): boolean {
        return this.deleted_at === null;
    }

    get hasUser(): boolean {
        return this.user_id !== null && this.user !== null;
    }

    get bonusBalanceAsNumber(): number {
        return parseFloat(this.bonus_balance) || 0;
    }
}