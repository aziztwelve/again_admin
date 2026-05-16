export class MoyskladSettings {
    id: number | undefined;
    email: string | undefined;
    password: string | undefined;
    apiUrl: string | undefined;
    apiKey: string | undefined;
    isActive: boolean | undefined;
    createdAt: string | undefined;
    updatedAt: string | undefined;
    syncSettings: Record<string, any> | null | undefined;
    lastSyncDate: string | null | undefined;
    syncFrequency: string | undefined;

    constructor() {
        this.id = undefined;
        this.email = undefined;
        this.password = undefined;
        this.apiUrl = undefined;
        this.apiKey = undefined;
        this.isActive = undefined;
        this.createdAt = undefined;
        this.updatedAt = undefined;
        this.syncSettings = null;
        this.lastSyncDate = undefined;
        this.syncFrequency = undefined;
    }

    static fromJSON(json: any): MoyskladSettings {
        const settings = new MoyskladSettings();
        settings.id = json.id;
        settings.email = json.email;
        settings.password = json.password;
        settings.apiUrl = json.api_url;
        settings.apiKey = json.api_key;
        settings.isActive = !!json.is_active;
        settings.createdAt = json.created_at;
        settings.updatedAt = json.updated_at;
        settings.syncSettings = json.sync_settings ?? null;
        settings.lastSyncDate = json.last_sync_date ?? undefined;
        settings.syncFrequency = json.sync_frequency;

        return settings;
    }

    toJSON(): any {
        return {
            email: this.email ?? null,
            password: this.password ?? null,
            api_url: this.apiUrl ?? null,
            api_key: this.apiKey ?? null,
            is_active: this.isActive ?? null,
            sync_settings: this.syncSettings ?? null,
            sync_frequency: this.syncFrequency ?? null,
        };
    }

    toJSONForSync(): any {
        return {
            email: this.email ?? null,
            password: this.password ?? null,
        };
    }

    clone(): MoyskladSettings {
        const cloned = new MoyskladSettings();

        cloned.id = this.id;
        cloned.email = this.email;
        cloned.password = this.password;
        cloned.apiUrl = this.apiUrl;
        cloned.apiKey = this.apiKey;
        cloned.isActive = this.isActive;
        cloned.createdAt = this.createdAt;
        cloned.updatedAt = this.updatedAt;
        cloned.syncSettings = this.syncSettings ? JSON.parse(JSON.stringify(this.syncSettings)) : null;
        cloned.lastSyncDate = this.lastSyncDate;
        cloned.syncFrequency = this.syncFrequency;

        return cloned;
    }

    // Additional helper methods specific to MoyskladSettings integration
    get isConfigured(): boolean {
        return !!this.apiUrl && !!this.apiKey;
    }

    get syncFrequencyLabel(): string {
        switch (this.syncFrequency) {
            case 'hourly':
                return 'Каждый час';
            case 'daily':
                return 'Ежедневно';
            case 'weekly':
                return 'Еженедельно';
            case 'manual':
                return 'Вручную';
            default:
                return this.syncFrequency ?? 'Не задано';
        }
    }
}