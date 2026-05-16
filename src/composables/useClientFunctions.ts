import axios from "axios";
import {toast} from "vue-sonner";
import {Client as ClientModel} from "@/models/client/Client";
import {Client as ClientType, ClientFormData} from "@/types/client"; // Импортируем тип

import {ref} from "vue";
import {PaginationMeta} from "@/types/Types";
import {useErrorHandler} from "@/composables/useErrorHandler";
import {useSuccessHandler} from "@/composables/useSuccessHandler";


interface ClientFilterParams {
    page: number;
    per_page: number;
    search?: string;
}


interface ClientResponse {
    clients: ClientType[];
    meta: PaginationMeta;
}

export function useClientFunctions() {

    const sending = ref(false)


    const getClients = async (page: number = 1, perPage: number = 10): Promise<{
        clients: ClientModel[],
        total: number
    } | null> => {
        try {
            const response = await axios.get(`/clients?page=${page}&per_page=${perPage}`);
            return {
                clients: response.data.data.map((item: any) => ClientModel.fromJSON(item)),
                total: response.data.total
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Ошибка при загрузке списка");
            } else {
                toast.error("Ошибка сети");
                console.error("Error fetching clients:", error);
            }
            return null;
        }
    };

    const getClientsByParams = async (params: ClientFilterParams): Promise<ClientResponse> => {
        sending.value = true;
        return await axios.get(`/clients`, {
            params: params,
        })
            .then((res) => {
                return {
                    clients: res.data.clients?.data ?? [],
                    meta: {
                        total: res.data.clients?.total ?? 0,
                    },
                }
            })
            .catch(e => {
                throw e
            })
            .finally(() => sending.value = false)
    };


    const addClient = async (client: ClientFormData): Promise<void> => {
        try {
            const response = await axios.post('/clients', client);
            if (response.data.status) {
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Что-то пошло не так");
            } else {
                toast.error("Неизвестная ошибка");
                console.error("Error adding client:", error);
            }
        }
    };

    const updateClient = async (client: ClientModel): Promise<ClientModel | null> => {
        try {

            const response = await axios.put(`/clients/${client.id}`, prepareClientDataForValidation(client));

            toast.success(response.data.message || "Данные клиента обновлены");

            return response.data?.data || null;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                useErrorHandler().showError(error, "Ошибка при обновлении")
            } else {
                toast.error("Ошибка сети");
                console.error("Error updating client:", error);
            }
            return null;
        }
    };

    const deleteClient = async (clientId: number): Promise<void> => {
        try {
            const response = await axios.delete(`/clients/${clientId}`);
            toast.success(response.data.message || "Клиент успешно удален");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Ошибка при удалении");
            } else {
                toast.error("Ошибка сети");
                console.error("Error deleting client:", error);
            }
        }
    };

    const getClient = async (clientId: number): Promise<ClientModel | null> => {
        try {
            const response = await axios.get(`/clients/${clientId}`);
            return ClientModel.fromJSON(response.data.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Ошибка при загрузке");
            } else {
                toast.error("Ошибка сети");
                console.error("Error fetching client:", error);
            }
            return null;
        }
    };


    function prepareClientDataForValidation(client: ClientModel) {
        const profile: any = client.profile ?? {};
        const c: any = client as any;
        return {
            first_name: profile.first_name ?? null,
            last_name: profile.last_name ?? null,
            middle_name: profile.middle_name ?? null,
            email: client.email ?? null,
            phone: profile.phone ?? null,
            address: profile.address ?? null,
            user_id: client?.id ?? null,
            birthday: profile.birthday ?? null,
            delivery_country_id: profile.delivery_country_id ?? null,
            delivery_city_id: profile.delivery_city_id ?? null,
            delivery_region: profile.delivery_region ?? null,
            delivery_street: profile.delivery_street ?? null,
            delivery_house: profile.delivery_house ?? null,
            delivery_apartment: profile.delivery_apartment ?? null,
            delivery_postal_code: profile.delivery_postal_code ?? null,
            subscribed_to_newsletter: c.subscribed_to_newsletter ?? false,
            personal_data_consent: c.personal_data_consent ?? false,
            messenger_subscription: c.messenger_subscription ?? false,
            rfm_segment: c.rfm_segment ?? null,
            group_name: c.group_name ?? null,
        };
    }


    const editClientCorrect = async (id: number | string, client: ClientFormData): Promise<ClientType> => {
        sending.value = true;
        return await axios.put(`clients/${id}`, client)
            .then((res) => {
                useSuccessHandler().showSuccess(res)
                return res.data.client;
            })
            .catch(e => {
                console.error(e);
                useErrorHandler().showError(e)
                throw e;
            })
            .finally(() => sending.value = true)
    }

    return {
        addClient,
        updateClient,
        deleteClient,
        getClient,
        getClients,
        getClientsByParams,
        editClientCorrect,
        sending
    };
}