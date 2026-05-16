import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from '@/composables/useErrorHandler'
import {useSuccessHandler} from '@/composables/useSuccessHandler'

export interface ExportOrdersParams {
    ids?: number[]
}

export function useExportOrders() {
    const sending = ref(false)
    const progress = ref(0)

    /**
     * Экспортировать заказы в CSV
     * @param params - параметры экспорта (ids - массив ID заказов, если пустой - экспорт всех)
     */
    const exportOrders = async (params?: ExportOrdersParams): Promise<void> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.post('export/orders', params || {}, {
            responseType: 'blob'
        })
            .then(res => {
                // Создаём ссылку для скачивания файла
                const url = window.URL.createObjectURL(new Blob([res.data]))
                const link = document.createElement('a')
                link.href = url

                // Получаем имя файла из заголовка ответа или генерируем
                const contentDisposition = res.headers['content-disposition']
                let fileName = `orders_${Date.now()}.csv`

                if (contentDisposition) {
                    const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/i)
                    if (fileNameMatch?.[1]) fileName = fileNameMatch[1]

                }

                link.setAttribute('download', fileName)
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)

                useSuccessHandler().showSuccess({data: {message: 'Экспорт заказов успешно выполнен'}})
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
        exportOrders,
    }
}