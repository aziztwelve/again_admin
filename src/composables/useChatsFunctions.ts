import {ref} from 'vue'
import axios, {AxiosProgressEvent} from 'axios'
import {useErrorHandler} from "@/composables/useErrorHandler";
import {Conversation, ConversationApiResponse, PendingFile, Message} from "@/types/conversation";

export function useChatsFunctions() {
    const sending = ref(false)
    const progress = ref(0)

    const getConversations = async (params: {
        per_page?: number,
        page?: number,
        source?: string
        search?: string
    }): Promise<ConversationApiResponse> => {

        sending.value = true
        progress.value = 0

        return await axios.get('conversations', {
            params: params
        })
            .then(res => res.data)

            .catch(e => {
                useErrorHandler().showError(e)
                console.error(e)
                throw e
            })
            .finally(() => sending.value = false)
    }

    // Получить подробную информацию о конкретном разговоре
    const getConversationByIdWithMessages = async (id: number | string):
        Promise<Conversation> => {

        sending.value = true
        progress.value = 0

        return await axios.get(`conversations/${id}`)
            .then(res => res.data)

            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => sending.value = false)
    }


    const conversationReplyById = async (
        conversationId: string | number,
        content: string,
        files?: PendingFile[]
    ): Promise<Message> => {

        sending.value = true
        progress.value = 0

        try {
            // Если есть файлы - используем FormData
            if (files && files.length > 0) {
                const formData = new FormData()


                // Добавляем текст (может быть пустым если только файлы)
                const messageContent = content.trim()
                formData.append('content', messageContent)

                // Добавляем файлы
                files.forEach((pendingFile, index) => {
                    formData.append(`attachments[${index}]`, pendingFile.file)
                })

                // Отправляем FormData
                const response = await axios.post(
                    `conversations/${conversationId}/reply`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                            if (progressEvent.total) {
                                progress.value = Math.round(
                                    (progressEvent.loaded * 100) / progressEvent.total
                                )
                            }
                        }
                    }
                )

                return response.data.data
            }

            // Если нет файлов - отправляем JSON как раньше
            const response = await axios.post(
                `conversations/${conversationId}/reply`,
                {
                    content: content,
                    attachments: []
                }
            )

            return response.data.data

        } catch (e) {
            useErrorHandler().showError(e)
            throw e
        } finally {
            sending.value = false
            progress.value = 0
        }
    }


    // Получить все диалоги конкретного клиента (для inline-чата на карточке заказа).
    // Бэкенд дополнительно подцепляет «анонимные» диалоги по email / телефону.
    const getConversationsByClient = async (
        clientId: number | string
    ): Promise<Conversation[]> => {
        if (!clientId) return []
        sending.value = true
        try {
            const { data } = await axios.get(`conversations/by-client/${clientId}`)
            return (data?.data || []) as Conversation[]
        } catch (e) {
            useErrorHandler().showError(e)
            throw e
        } finally {
            sending.value = false
        }
    }

    return {
        sending,
        progress,
        getConversations,
        getConversationByIdWithMessages,
        getConversationsByClient,
        conversationReplyById
    }
}
