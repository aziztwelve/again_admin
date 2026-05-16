import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from "@/composables/useErrorHandler";
import ContactRequest from "@/models/ContactRequest"; // модель для заявки (создай, как Order)
import {useSuccessHandler} from "@/composables/useSuccessHandler";
import {PaginationMeta} from "@/types/Types";
import type {OtoBannerSubmission} from "@/features/oto-banner/types";

export function useContactRequestFunctions() {
    const sending = ref(false)

    const getContactRequests = async (params: {
        id?: number | string,
        status?: string,
        per_page?: number,
        page?: number,
        search?: string,
        date_from?: string,
        date_to?: string,
    }): Promise<{
        contactRequests: ContactRequest[],
        meta: PaginationMeta
    } | null> => {
        sending.value = true

        return await axios.get('contact-requests', {params})
            .then(res => {
                const contactRequests: ContactRequest[] = res.data.data.map((item: any) => ContactRequest.fromJSON(item))

                return {
                    contactRequests,
                    meta: {
                        page: res.data?.meta?.page,
                        per_page: res.data?.meta?.per_page,
                        total: res.data?.meta?.total,
                    }
                }
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const getCount = async (): Promise<number | null> => {
        sending.value = true
        return await axios.get('contact-requests/count')
            .then(res => {
                return res.data.count // предполагается, что count возвращается в таком поле
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const getContactRequestById = async (id: number | string): Promise<ContactRequest | null> => {
        sending.value = true
        return await axios.get(`contact-requests/${id}`)
            .then(res => ContactRequest.fromJSON(res.data))
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const updateContactRequest = async (id: number | string, formData: object): Promise<any> => {
        sending.value = true
        return await axios.patch(`contact-requests/${id}`, formData)
            .then(res => res.data)
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const deleteContactRequest = async (id: number | string): Promise<boolean> => {
        sending.value = true
        return await axios.delete(`contact-requests/${id}`)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return true
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return false
            })
            .finally(() => sending.value = false)
    }


    const attachManager = async (
        id: number | string,
        managerId: number | null
    ): Promise<OtoBannerSubmission | undefined> => {
        if (sending.value) return

        sending.value = true

        return await axios.post<{
            success: boolean;
            message: string;
            data: OtoBannerSubmission
        }>(
            `contact-requests/${id}/attach-manager`,
            {manager_id: managerId}
        )
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => {
                sending.value = false
            })
    }

    return {
        sending,
        getContactRequests,
        getCount,
        getContactRequestById,
        updateContactRequest,
        deleteContactRequest,
        attachManager
    }
}
