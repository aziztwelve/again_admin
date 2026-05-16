import { ref } from "vue";
import axios, { AxiosProgressEvent } from "axios";
import { useErrorHandler } from "@/composables/useErrorHandler";
import { useSuccessHandler } from "@/composables/useSuccessHandler";

export function useMaxFunctions() {
  const sending = ref(false);
  const progress = ref(0);

  // Получение настроек Max
  const getMaxSettings = async () => {
    if (sending.value) return;

    sending.value = true;
    progress.value = 0;

    try {
      const res = await axios.get("third-party-integrations/max/settings");
      return res.data;
    } catch (e) {
      useErrorHandler().showError(e);
    } finally {
      sending.value = false;
    }
  };

  // Сохранение настроек Max (автоматически регистрирует webhook)
  const saveMaxSettings = async (params: {
    bot_token: string;
    is_active?: boolean;
  }) => {
    if (sending.value) return;

    sending.value = true;
    progress.value = 0;

    try {
      const res = await axios.post(
        "third-party-integrations/max/settings",
        params,
        {
          onUploadProgress: (event: AxiosProgressEvent) => {
            if (event.total && event.loaded != null) {
              progress.value = Math.round((event.loaded * 100) / event.total);
            }
          },
        },
      );

      useSuccessHandler().showSuccess(res);
      return res.data;
    } catch (e) {
      useErrorHandler().showError(e);
      throw e;
    } finally {
      sending.value = false;
    }
  };

  // Тест подключения к Max
  const testMaxConnection = async () => {
    if (sending.value) return;

    sending.value = true;
    progress.value = 0;

    try {
      const res = await axios.post(
        "third-party-integrations/max/settings/test",
      );
      useSuccessHandler().showSuccess(res);
      return res.data;
    } catch (e) {
      useErrorHandler().showError(e);
      throw e;
    } finally {
      sending.value = false;
    }
  };

  // Получить URL webhook
  const getWebhookUrl = async () => {
    try {
      const res = await axios.get("third-party-integrations/max/webhook/url");
      return res.data;
    } catch (e) {
      useErrorHandler().showError(e);
    }
  };

  // Получить список активных webhook подписок
  const getWebhookSubscriptions = async () => {
    try {
      const res = await axios.get(
        "third-party-integrations/max/webhook/subscriptions",
      );
      return res.data;
    } catch (e) {
      useErrorHandler().showError(e);
    }
  };

  // Удалить webhook подписку
  const unregisterWebhook = async () => {
    if (sending.value) return;

    sending.value = true;
    progress.value = 0;

    try {
      const res = await axios.post(
        "third-party-integrations/max/webhook/unregister",
      );
      useSuccessHandler().showSuccess(res);
      return res.data;
    } catch (e) {
      useErrorHandler().showError(e);
      throw e;
    } finally {
      sending.value = false;
    }
  };

  // Перерегистрировать webhook
  const reregisterWebhook = async () => {
    if (sending.value) return;

    sending.value = true;
    progress.value = 0;

    try {
      const res = await axios.post(
        "third-party-integrations/max/webhook/reregister",
      );
      useSuccessHandler().showSuccess(res);
      return res.data;
    } catch (e) {
      useErrorHandler().showError(e);
      throw e;
    } finally {
      sending.value = false;
    }
  };

  return {
    sending,
    progress,
    getMaxSettings,
    saveMaxSettings,
    testMaxConnection,
    getWebhookUrl,
    getWebhookSubscriptions,
    unregisterWebhook,
    reregisterWebhook,
  };
}
