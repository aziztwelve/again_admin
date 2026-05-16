import {Client} from './index'

export interface ClientFormData {
    email: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    phone?: string;
    address?: string;
    birthday?: string | null;
    level_id?: number;
    subscribed_to_newsletter?: boolean;
    personal_data_consent?: boolean;
    messenger_subscription?: boolean;
    delivery_country_id?: number | null;
    delivery_city_id?: number | null;
    delivery_region?: string;
    delivery_street?: string;
    delivery_house?: string;
    delivery_apartment?: string;
    delivery_postal_code?: string;
    rfm_segment?: string;
    group_name?: string;
}

export function createClientFormData(): ClientFormData {
    return {
        email: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        phone: '',
        address: '',
        birthday: '',
        level_id: undefined,
        subscribed_to_newsletter: false,
        personal_data_consent: false,
        messenger_subscription: false,
        delivery_country_id: null,
        delivery_city_id: null,
        delivery_region: '',
        delivery_street: '',
        delivery_house: '',
        delivery_apartment: '',
        delivery_postal_code: '',
        rfm_segment: '',
        group_name: '',
    }
}

export function clientToFormData(client: Client): ClientFormData {
    return {
        email: client.email || '',
        first_name: client.profile?.first_name || '',
        last_name: client.profile?.last_name || '',
        middle_name: client.profile?.middle_name || '',
        phone: client.profile?.phone || '',
        address: client.profile?.address || '',
        birthday: client.profile?.birthday || null,
        level_id: undefined,
        subscribed_to_newsletter: client.subscribed_to_newsletter ?? false,
        personal_data_consent: client.personal_data_consent ?? false,
        messenger_subscription: client.messenger_subscription ?? false,
        delivery_country_id: client.profile?.delivery_country_id ?? null,
        delivery_city_id: client.profile?.delivery_city_id ?? null,
        delivery_region: client.profile?.delivery_region || '',
        delivery_street: client.profile?.delivery_street || '',
        delivery_house: client.profile?.delivery_house || '',
        delivery_apartment: client.profile?.delivery_apartment || '',
        delivery_postal_code: client.profile?.delivery_postal_code || '',
        rfm_segment: client.rfm_segment || '',
        group_name: client.group_name || '',
    }
}