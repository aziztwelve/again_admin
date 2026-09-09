import axios from 'axios'
import { ref } from 'vue'

export interface PaymentMethodOption {
    value: string
    label: string
}

const getDefaultPaymentMethods = (): PaymentMethodOption[] => ([
    { value: 'card_ru', label: 'Оплата картами РФ, TPay, СБП' },
    { value: 'yandex_pay', label: 'Яндекс Пэй и Сплит' },
])

const normalizePaymentMethodsResponse = (response: any): PaymentMethodOption[] => {
    const payload = response?.data?.data ?? response?.data ?? response
    const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.payment_methods)
            ? payload.payment_methods
            : Array.isArray(payload?.methods)
                ? payload.methods
                : []

    const normalized = list
        .map((item: any) => {
            if (typeof item === 'string') {
                return { value: item, label: item }
            }

            const value = item?.value ?? item?.code ?? item?.key ?? item?.id ?? item?.name
            const label = item?.label ?? item?.name ?? item?.title ?? String(value ?? '')
            if (!value) return null

            return {
                value: String(value),
                label: String(label),
            }
        })
        .filter(Boolean) as PaymentMethodOption[]

    return normalized.length ? normalized : getDefaultPaymentMethods()
}

export function useOrderPaymentMethods() {
    const paymentMethodOptions = ref<PaymentMethodOption[]>([])

    const fetchPaymentMethods = async (): Promise<PaymentMethodOption[]> => {
        const endpoints = ['/public/payment-methods', '/orders/payment-methods']

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(endpoint)
                paymentMethodOptions.value = normalizePaymentMethodsResponse(response)
                return paymentMethodOptions.value
            } catch (e) {
                // Try next endpoint.
            }
        }

        paymentMethodOptions.value = getDefaultPaymentMethods()
        return paymentMethodOptions.value
    }

    return {
        paymentMethodOptions,
        fetchPaymentMethods,
        getDefaultPaymentMethods,
    }
}
