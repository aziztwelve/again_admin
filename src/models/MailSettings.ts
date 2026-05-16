export default class MailSettings {
    mailer: string | null | undefined;
    host: string | undefined;
    port: number | undefined;
    imap_host: string | undefined;
    imap_port: number | undefined;
    username: string | undefined;
    password: string | undefined;
    encryption: string | null | undefined;
    from_address: string | null | undefined;
    notification_email: string | null | undefined;
    created_at: string | undefined;
    updated_at: string | undefined;

    constructor() {
        this.mailer = 'smtp';
        this.host = undefined;
        this.port = undefined;
        this.imap_host = undefined;
        this.imap_port = undefined;
        this.username = undefined;
        this.password = undefined;
        this.encryption = null;
        this.from_address = null;
        this.notification_email = null;
        this.created_at = undefined;
        this.updated_at = undefined;
    }

    static fromJSON(json: any): MailSettings {
        const ms = new MailSettings();
        ms.mailer = json.mailer ?? null;
        ms.host = json.host;
        ms.port = json.port;
        ms.imap_host = json.imap_host;
        ms.imap_port = json.imap_port;
        ms.username = json.username;
        ms.password = json.password;
        ms.encryption = json.encryption ?? null;
        ms.from_address = json.from_address ?? null;
        ms.notification_email = json.notification_email ?? null;
        ms.created_at = json.created_at;
        ms.updated_at = json.updated_at;
        return ms;
    }

    toJSONForUpdate() {
        return {
            mailer: this.mailer,
            host: this.host,
            port: this.port,
            imap_host: this.imap_host,
            imap_port: this.imap_port,
            username: this.username,
            password: this.password,
            encryption: this.encryption,
            from_address: this.from_address,
            notification_email: this.notification_email,
        }
    }
}
