import { ref } from 'vue'

export const useFormErrors = () => {
    const errors = ref<Record<string, string[]>>({})

    const setErrors = (newErrors: Record<string, string[]>) => {
        errors.value = newErrors
    }

    const resetErrors = () => {
        errors.value = {}
    }

    const getError = (field: string): string | null => {
        return errors.value[field]?.[0] || null
    }

    return { errors, setErrors, resetErrors, getError }
}