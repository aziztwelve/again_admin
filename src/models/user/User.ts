import {UserProfile} from "@/models/user/Profile";
import {UserRole} from "@/models/user/Role";
import {UserPermission} from "@/models/user/Permission";

export class User {
    public id: number | null;
    public email: string | null;
    public email_verified_at: string | null;
    public created_at: string | null;
    public updated_at: string | null;
    public deleted_at: string | null;
    public name: string | null;
    public profile: UserProfile | null;
    public roles: UserRole[];
    public permissions: UserPermission[];

    constructor(data: Partial<User> = {}) {
        this.id = data.id ?? null;
        this.email = data.email ?? null;
        this.email_verified_at = data.email_verified_at ?? null;
        this.created_at = data.created_at ?? null;
        this.updated_at = data.updated_at ?? null;
        this.deleted_at = data.deleted_at ?? null;
        this.name = data.name ?? null;

        // Инициализация profile с созданием экземпляра UserProfile, если данные переданы
        this.profile = data.profile
            ? new UserProfile(data.profile)
            : null;

        // Инициализация roles с созданием экземпляров UserRole
        this.roles = data.roles
            ? data.roles.map(role => UserRole.fromJSON(role))
            : [];
        // this.roles = data?.roles[0]?.id || null;

        // Инициализация permissions с созданием экземпляров UserPermission
        this.permissions = data.permissions
            ? data.permissions?.map(perm => UserPermission.fromJSON(perm))
            : [];
    }

    get fullName(): string | null {
        if (this.profile?.first_name && this.profile?.last_name) {
            return `${this.profile.first_name} ${this.profile.last_name}`;
        }
        return this.profile?.first_name ?? this.profile?.last_name ?? null;
    }

    get isSuperAdmin(): boolean {
        return <boolean>this.roles?.some(role => role.id === 1 || 2);
    }

    get isVerified(): boolean {
        return this.email_verified_at !== null;
    }

    get isActive(): boolean {
        return this.deleted_at === null;
    }

    get getPhone(): string | null {
        return this.profile?.phone ?? null;
    }

    get getRoleNames(): string | null {

        return this.roles.length > 0
            ? this.roles.map(role => role.name).join(", ")
            : null;
    }

    public static fromJSON(json: any): User {
        return new User({
            id: json.id ?? null,
            email: json.email ?? null,
            email_verified_at: json.email_verified_at ?? null,
            created_at: json.created_at ?? null,
            updated_at: json.updated_at ?? null,
            deleted_at: json.deleted_at ?? null,
            name: json.name ?? null,
            profile: json.profile ? UserProfile.fromJSON(json.profile) : null,
            roles: json.roles ?? [],
            permissions: json.permissions ?? []
        });
    }

    public toJSON(): any {
        return {
            id: this.id,
            email: this.email,
            email_verified_at: this.email_verified_at,
            created_at: this.created_at,
            updated_at: this.updated_at,
            deleted_at: this.deleted_at,
            profile: this.profile ? this.profile?.toJSON() ?? {
                id: this.profile.id,
                user_id: this.profile.user_id,
                first_name: this.profile.first_name,
                last_name: this.profile.last_name,
                phone: this.profile.phone ?? '',
                address: this.profile.address ?? ''
            } : null,
            roles: this.roles ? this.roles.map(role => role?.toJSON() ?? {
                id: role.id,
                name: role.name,
                slug: role.slug,
                description: role.description
            }) : null,
            permissions: this.permissions ? this.permissions.map(perm => perm?.toJSON() ?? {
                id: perm.id,
                name: perm.name,
                slug: perm.slug,
                description: perm.description
            }) : null
        };
    }


    public static searchByNameOrEmail(users: User[], query: string): User[] {
        const lowerQuery = query.toLowerCase().trim();

        return users.filter(user => {
            const firstName = user.profile?.first_name?.toLowerCase() || '';
            const lastName = user.profile?.last_name?.toLowerCase() || '';
            const fullName = `${firstName} ${lastName}`.trim();
            const email = user.email?.toLowerCase() || '';

            return (
                firstName.includes(lowerQuery) ||
                lastName.includes(lowerQuery) ||
                fullName.includes(lowerQuery) ||
                email.includes(lowerQuery)
            );
        })
    }

}