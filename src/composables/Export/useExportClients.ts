import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from '@/composables/useErrorHandler'
import {useSuccessHandler} from '@/composables/useSuccessHandler'

export interface ExportClientsParams {
    ids?: number[]
}

export function useExportClients() {
    const sending = ref(false)
    const progress = ref(0)

    /**
     * Экспортировать клиентов в CSV
     * @param params - параметры экспорта (ids - массив ID клиентов, если пустой - экспорт всех)
     */
    const exportClients = async (params?: ExportClientsParams): Promise<void> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.post('export/clients', params || {}, {
            responseType: 'blob'
        })
            .then(res => {
                // Создаём ссылку для скачивания файла
                const url = window.URL.createObjectURL(new Blob([res.data]))
                const link = document.createElement('a')
                link.href = url

                // Получаем имя файла из заголовка ответа или генерируем
                const contentDisposition = res.headers['content-disposition']
                let fileName = `clients_${Date.now()}.csv`

                if (contentDisposition) {
                    const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/i)
                    if (fileNameMatch?.[1]) fileName = fileNameMatch[1]
                }

                link.setAttribute('download', fileName)
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)

                useSuccessHandler().showSuccess({data: {message: 'Экспорт успешно выполнен'}})
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
        progress,
        exportClients,
    }
}