import axios from 'axios';
import { computed, reactive, ref, unref, type Ref } from 'vue';

type ClientLike = {
    id?: number | string | null;
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    profile?: {
        first_name?: string | null;
        last_name?: string | null;
        phone?: string | null;
    } | null;
};

type QuickClientForm = {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    consent_to_personal_data: boolean;
    messenger_subscription: boolean;
};

type QuickClientErrors = Record<
    'first_name' | 'last_name' | 'phone' | 'email' | 'consent_to_personal_data',
    string
>;

type UseQuickClientCreateOptions = {
    clients?: Ref<ClientLike[] | null | undefined> | ClientLike[] | null | undefined;
    refreshClients?: () => Promise<unknown> | unknown;
};

const getInitialQuickClient = (): QuickClientForm => ({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    consent_to_personal_data: false,
    messenger_subscription: false,
});

const getInitialErrors = (): QuickClientErrors => ({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    consent_to_personal_data: '',
});

export function useQuickClientCreate(options: UseQuickClientCreateOptions = {}) {
    const isCreating = ref(false);

    const quickClient = reactive(getInitialQuickClient());
    const quickClientErrors = reactive(getInitialErrors());

    const normalizedClients = computed(() => {
        const value = unref(options.clients);
        return Array.isArray(value) ? value : [];
    });

    const resetErrors = () => {
        Object.assign(quickClientErrors, getInitialErrors());
    };

    const resetForm = () => {
        Object.assign(quickClient, getInitialQuickClient());
        resetErrors();
    };

    const validate = () => {
        resetErrors();

        if (!quickClient.first_name?.trim()) {
            quickClientErrors.first_name = 'Поле обязательно';
        }

        if (!quickClient.last_name?.trim()) {
            quickClientErrors.last_name = 'Поле обязательно';
        }

        if (!quickClient.phone?.trim()) {
            quickClientErrors.phone = 'Поле обязательно';
        }

        if (!quickClient.email?.trim()) {
            quickClientErrors.email = 'Поле обязательно';
        } else {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(quickClient.email.trim())) {
                quickClientErrors.email = 'Некорректный email';
            }
        }

        if (!quickClient.consent_to_personal_data) {
            quickClientErrors.consent_to_personal_data = 'Требуется согласие';
        }

        return !Object.values(quickClientErrors).some(Boolean);
    };

    const extractCreatedClientId = (response: any) => {
        const payload = response?.data?.client ?? response?.data?.data ?? response?.data ?? null;
        return payload?.id ?? null;
    };

    const extractCreatedClient = (response: any) => {
        return response?.data?.client ?? response?.data?.data ?? response?.data ?? null;
    };

    const mapApiErrors = (error: any) => {
        const apiErrors = error?.response?.data?.errors;
        if (!apiErrors || typeof apiErrors !== 'object') {
            return;
        }

        quickClientErrors.first_name = apiErrors.first_name?.[0] || quickClientErrors.first_name;
        quickClientErrors.last_name = apiErrors.last_name?.[0] || quickClientErrors.last_name;
        quickClientErrors.phone = apiErrors.phone?.[0] || quickClientErrors.phone;
        quickClientErrors.email = apiErrors.email?.[0] || quickClientErrors.email;
        quickClientErrors.consent_to_personal_data =
            apiErrors.consent_to_personal_data?.[0] || quickClientErrors.consent_to_personal_data;
    };

    const createQuickClient = async () => {
        if (!validate()) {
            return null;
        }

        isCreating.value = true;

        const payload = {
            first_name: quickClient.first_name.trim(),
            last_name: quickClient.last_name.trim(),
            phone: quickClient.phone.trim(),
            email: quickClient.email.trim(),
            consent_to_personal_data: quickClient.consent_to_personal_data,
            messenger_subscription: quickClient.messenger_subscription,
        };

        try {
            const response = await axios.post('/clients', payload);
            const createdClient = extractCreatedClient(response);
            let createdClientId = extractCreatedClientId(response);

            if (typeof options.refreshClients === 'function') {
                await options.refreshClients();
            }

            let matchedClient = null;
            if (!createdClientId) {
                matchedClient = normalizedClients.value.find(
                    (client) => `${client.email || ''}`.toLowerCase() === payload.email.toLowerCase()
                );
                createdClientId = matchedClient?.id ?? null;
            }

            resetForm();

            return {
                id: createdClientId,
                first_name:
                    createdClient?.first_name ??
                    createdClient?.profile?.first_name ??
                    matchedClient?.first_name ??
                    matchedClient?.profile?.first_name ??
                    payload.first_name,
                last_name:
                    createdClient?.last_name ??
                    createdClient?.profile?.last_name ??
                    matchedClient?.last_name ??
                    matchedClient?.profile?.last_name ??
                    payload.last_name,
                phone:
                    createdClient?.phone ??
                    createdClient?.profile?.phone ??
                    matchedClient?.phone ??
                    matchedClient?.profile?.phone ??
                    payload.phone,
                email: createdClient?.email ?? matchedClient?.email ?? payload.email,
            };
        } catch (error) {
            mapApiErrors(error);
            return null;
        } finally {
            isCreating.value = false;
        }
    };

    return {
        quickClient,
        quickClientErrors,
        isCreating,
        createQuickClient,
        resetQuickClientForm: resetForm,
    };
}
