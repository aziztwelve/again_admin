import { toast } from 'vue-sonner'

export const useSuccessHandler = () => {
  const showSuccess = (response: any, defaultMessage: string = 'Успешно!') => {
    let message = defaultMessage

    if (response?.data?.message) {
      message = response.data.message
    } else if (response?.message) {
      message = response.message
    }

    toast.success(message)
  }

  return {
    showSuccess
  }
}
