import { ref } from 'vue'
import axios from 'axios'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useSuccessHandler } from '@/composables/useSuccessHandler'

export interface AmneziaVpnSettings {
  enabled: boolean
  scheme: string
  host: string
  port: number | null
  username: string | null
  password?: string
  has_password: boolean
  last_check: AmneziaVpnCheck | null
}

export interface AmneziaVpnCheck {
  checked_at: string
  proxy_configured: boolean
  external_ip: string | null
  telegram_status: number | null
  ok: boolean
  message: string | null
}

export function useAmneziaVpn() {
  const sending = ref(false)

  const getSettings = async (): Promise<AmneziaVpnSettings | null> => {
    try {
      const res = await axios.get('third-party-integrations/amnezia-vpn')
      return res.data?.data ?? null
    } catch (e) {
      useErrorHandler().showError(e)
      return null
    }
  }

  const saveSettings = async (payload: Partial<AmneziaVpnSettings>) => {
    if (sending.value) return null
    sending.value = true

    try {
      const res = await axios.patch('third-party-integrations/amnezia-vpn', payload)
      useSuccessHandler().showSuccess(res)
      return res.data?.data ?? null
    } catch (e) {
      useErrorHandler().showError(e)
      return null
    } finally {
      sending.value = false
    }
  }

  const testConnection = async (): Promise<AmneziaVpnCheck | null> => {
    if (sending.value) return null
    sending.value = true

    try {
      const res = await axios.post('third-party-integrations/amnezia-vpn/test')
      useSuccessHandler().showSuccess(res)
      return res.data?.data ?? null
    } catch (e) {
      useErrorHandler().showError(e)
      return null
    } finally {
      sending.value = false
    }
  }

  return {
    sending,
    getSettings,
    saveSettings,
    testConnection,
  }
}
