import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from '@/composables/useErrorHandler'
import {useSuccessHandler} from '@/composables/useSuccessHandler'

export interface ExportReviewsParams {
    ids?: number[]
}

export function useExportReviews() {
    const sending = ref(false)
    const progress = ref(0)

    /**
     * Экспортировать отзывы в CSV
     * @param params - параметры экспорта (ids - массив ID отзывов, если пустой - экспорт всех)
     */
    const exportReviews = async (params?: ExportReviewsParams): Promise<void> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.post('export/reviews', params || {}, {
            responseType: 'blob'
        })
            .then(res => {
                // Создаём ссылку для скачивания файла
                const url = window.URL.createObjectURL(new Blob([res.data]))
                const link = document.createElement('a')
                link.href = url

                // Получаем имя файла из заголовка ответа или генерируем
                const contentDisposition = res.headers['content-disposition']
                let fileName = `reviews_${Date.now()}.csv`

                if (contentDisposition) {
                    const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/i)
                    if (fileNameMatch?.[1]) fileName = fileNameMatch[1]
                }

                link.setAttribute('download', fileName)
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)

                useSuccessHandler().showSuccess({data: {message: 'Экспорт отзывов успешно выполнен'}})
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
        exportReviews,
    }
}