import {Order} from "@/types/order";
import {Tag} from "@/types/tag";
import {Segment} from "@/features/segment/types";

export interface Profile {
    id: number;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    full_name?: string;
    phone?: string;
    address?: string;
    birthday?: string;
    telegram_user_id?: string;
    telegram_chat_id?: string;
    vk_user_id?: string;
    image?: string;
    delivery_address?: string;
    delivery_country_id?: number | null;
    delivery_city_id?: number | null;
    delivery_region?: string;
    delivery_street?: string;
    delivery_house?: string;
    delivery_apartment?: string;
    delivery_postal_code?: string;
}


export interface Client {
    id: number;
    name: string;
    email: string;
    full_name?: string;
    profile?: Profile;
    last_order?: Order
    tags?: Tag[];
    segments?: Segment[];
    subscribed_to_newsletter?: boolean;
    personal_data_consent?: boolean;
    messenger_subscription?: boolean;
    rfm_segment?: string | null;
    group_name?: string | null;
    created_at: string;
    updated_at?: string;
    deleted_at?: string;
}

