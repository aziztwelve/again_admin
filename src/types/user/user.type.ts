import {Profile} from "@/types/client";

export interface Role {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

export interface Permission {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

export interface User {
    id: number;
    email: string;
    email_verified_at?: string | null;
    full_name?: string;
    profile?: Profile;
    roles?: Role[];
    permissions?: Permission[];
    verification_code?: string | null;
    verification_sent?: string | null;
    verified_at?: string | null;
    created_at: string;
    updated_at?: string;
    deleted_at?: string | null;
}
