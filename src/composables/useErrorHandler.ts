import { toast } from 'vue-sonner'

export const useErrorHandler = () => {
  const showError = (error: any, defaultMessage: string = 'Что-то пошло не так') => {
    // Если сервер вернул ошибки валидации (422) — показываем конкретные сообщения по полям,
    // а не общий message ("Ошибка валидации").
    const errors = error?.response?.data?.errors
    if (errors && typeof errors === 'object') {
      const messages: string[] = []
      Object.values(errors).forEach((fieldErrors: any) => {
        if (Array.isArray(fieldErrors)) {
          fieldErrors.forEach((m: string) => { if (m) messages.push(m) })
        } else if (typeof fieldErrors === 'string') {
          messages.push(fieldErrors)
        }
      })
      if (messages.length) {
        messages.forEach((m) => toast.error(m))
        return
      }
    }

    let message = defaultMessage

    if (error?.response?.data?.error) {
      message = error.response.data.error
    } else if (error?.response?.data?.message) {
      message = error.response.data.message
    } else if (error?.message) {
      message = error.message
    }

    toast.error(message)
  }

  const getValidationErrors = (error: any): Record<string, string[]> => {
    if (error?.response?.data?.errors) {
      return error.response.data.errors
    }
    return {}
  }

  const formatValidationErrors = (errors: Record<string, string[]>): string[] => {
    const messages: string[] = []
    Object.keys(errors).forEach((field) => {
      const fieldErrors = errors[field]
      if (Array.isArray(fieldErrors)) {
        fieldErrors.forEach((errorMsg: string) => {
          messages.push(translateError(field, errorMsg))
        })
      }
    })
    return messages
  }

  const translateError = (field: string, message: string): string => {
    const fieldTranslations: Record<string, string> = {
      'name': 'Название',
      'description': 'Описание',
      'starts_at': 'Дата начала',
      'ends_at': 'Дата окончания',
      'min_purchase_amount': 'Минимальная сумма покупки',
      'allow_promo_codes': 'Разрешить промокоды',
      'is_active': 'Активна',
      'priority': 'Приоритет',
      'max_uses': 'Максимальное количество использований',
      'trigger_product_ids': 'Товары акции',
      'gift_products': 'Товары-подарки',
    }

    const fieldName = fieldTranslations[field] || field

    // Переводим распространенные сообщения об ошибках
    if (message.includes('is required') || message.includes('field is required')) {
      return `${fieldName}: Обязательное поле`
    }
    if (message.includes('must be a date after')) {
      return `${fieldName}: Должна быть позже даты начала`
    }
    if (message.includes('must be a string')) {
      return `${fieldName}: Должно быть текстом`
    }
    if (message.includes('must be a number') || message.includes('must be numeric')) {
      return `${fieldName}: Должно быть числом`
    }
    if (message.includes('must be a boolean')) {
      return `${fieldName}: Должно быть да/нет`
    }
    if (message.includes('must be an array')) {
      return `${fieldName}: Должен быть списком`
    }
    if (message.includes('must be at least')) {
      const match = message.match(/at least (\d+)/)
      const min = match ? match[1] : ''
      return `${fieldName}: Минимум ${min} элементов`
    }
    if (message.includes('may not be greater than')) {
      const match = message.match(/greater than (\d+)/)
      const max = match ? match[1] : ''
      return `${fieldName}: Максимум ${max}`
    }
    if (message.includes('must be greater than')) {
      const match = message.match(/greater than (\d+)/)
      const min = match ? match[1] : ''
      return `${fieldName}: Должно быть больше ${min}`
    }

    return `${fieldName}: ${message}`
  }

  return {
    showError,
    getValidationErrors,
    formatValidationErrors,
    translateError
  }
}
