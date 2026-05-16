<template>
  <div class="">
    <Card>
      <CardHeader>
        <div class="flex items-center space-x-3">
          <div
            class="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white"
          >
            <MessageCircle class="w-4 h-4" />
          </div>

          <div class="flex-1">
            <CardTitle class="text-base">Max API</CardTitle>
            <CardDescription class="text-sm"
              >Интеграция с мессенджером Max</CardDescription
            >
          </div>

          <div class="flex items-center space-x-2">
            <Switch v-model="maxEnabled" />
          </div>
        </div>
      </CardHeader>

      <CardContent :class="{ 'opacity-50 pointer-events-none': !maxEnabled }">
        <div class="mb-3" v-if="sending">
          <div class="h-2 bg-gray-200 rounded">
            <div
              class="h-2 rounded bg-blue-600"
              :style="{ width: progress + '%' }"
            ></div>
          </div>
          <p class="text-xs mt-1">Прогресс: {{ progress }}%</p>
        </div>

        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="max-api-token">Bot Token</Label>
            <Input
              id="max-api-token"
              v-model="maxForm.bot_token"
              type="password"
              placeholder="Введите токен бота от @MasterBot"
              :disabled="!maxEnabled"
            />
          </div>
        </div>
      </CardContent>

      <div class="flex items-center px-7 pb-2 space-x-3">
        <Button :disabled="sending || !maxEnabled" @click="onSave"
          >Сохранить</Button
        >
        <Button
          :disabled="sending || !maxEnabled"
          @click="onTest"
          variant="outline"
          >Проверить подключение</Button
        >
      </div>
    </Card>

    <!-- Webhook Status -->
    <Card v-if="maxEnabled && webhookInfo" class="mt-4">
      <CardHeader>
        <CardTitle class="text-base">Статус Webhook</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center space-x-2">
          <div
            class="w-3 h-3 rounded-full"
            :class="webhookRegistered ? 'bg-green-500' : 'bg-gray-300'"
          />
          <span
            class="text-sm"
            :class="webhookRegistered ? 'text-green-600' : 'text-gray-500'"
          >
            {{ webhookRegistered ? "Зарегистрирован" : "Не зарегистрирован" }}
          </span>
        </div>

        <div v-if="webhookInfo.full_url" class="space-y-1">
          <Label class="text-xs text-muted-foreground">URL:</Label>
          <p class="text-sm font-mono bg-gray-50 p-2 rounded">
            {{ webhookInfo.full_url }}
          </p>
        </div>

        <div class="flex items-center space-x-2">
          <Button
            :disabled="sending"
            @click="onReregisterWebhook"
            variant="outline"
            size="sm"
          >
            Перерегистрировать
          </Button>
          <Button
            :disabled="sending"
            @click="onUnregisterWebhook"
            variant="destructive"
            size="sm"
          >
            Удалить
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Active Subscriptions -->
    <Card
      v-if="maxEnabled && subscriptions && subscriptions.length > 0"
      class="mt-4"
    >
      <CardHeader>
        <CardTitle class="text-base"
          >Активные подписки ({{ subscriptions.length }})</CardTitle
        >
      </CardHeader>
      <CardContent>
        <div
          v-for="(sub, index) in subscriptions"
          :key="index"
          class="mb-4 last:mb-0"
        >
          <div class="border rounded-lg p-3 space-y-2">
            <div class="space-y-1">
              <Label class="text-xs text-muted-foreground">URL:</Label>
              <p class="text-sm font-mono">{{ sub.url }}</p>
            </div>
            <div class="space-y-1">
              <Label class="text-xs text-muted-foreground">События:</Label>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="event in sub.update_types"
                  :key="event"
                  class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                >
                  {{ event }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Справка -->
    <Card v-if="maxEnabled" class="bg-blue-50 border-blue-200 mt-4">
      <CardHeader>
        <CardTitle class="text-sm">Как получить токен бота Max?</CardTitle>
      </CardHeader>
      <CardContent class="text-sm text-muted-foreground space-y-2">
        <p>1. Открой диалог с @MasterBot в Max Messenger</p>
        <p>2. Следуй инструкциям для создания нового бота</p>
        <p>3. Скопируй полученный токен и вставь выше</p>
        <p>4. Нажми "Сохранить" - webhook зарегистрируется автоматически</p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useMaxFunctions } from "@/features/max/composables/useMaxFunctions";
import { useErrorHandler } from "@/composables/useErrorHandler";
import { useSuccessHandler } from "@/composables/useSuccessHandler";
import { encryptToken } from "@/utils/crypto";

const maxEnabled = ref(false);
const sending = ref(false);
const progress = ref(0);
const webhookInfo = ref<any>(null);
const subscriptions = ref<any[]>([]);

const maxForm = ref<any>({
  bot_token: "",
});

const {
  getMaxSettings,
  saveMaxSettings,
  testMaxConnection,
  getWebhookUrl,
  getWebhookSubscriptions,
  unregisterWebhook,
  reregisterWebhook,
} = useMaxFunctions();

const errorHandler = useErrorHandler();
const successHandler = useSuccessHandler();

// Проверка, зарегистрирован ли webhook
const webhookRegistered = computed(() => {
  return subscriptions.value && subscriptions.value.length > 0;
});

// Загрузка существующих настроек
const loadSettings = async () => {
  sending.value = true;
  progress.value = 0;
  try {
    const res = await getMaxSettings();
    if (res) {
      maxEnabled.value = res.is_active || false;
      // Токен не возвращается с бэкенда (скрыт), поэтому оставляем пустым
    }
  } catch (e) {
    // Если настроек нет, это нормально
    console.log("No settings found yet");
  } finally {
    sending.value = false;
  }
};

// Загрузка информации о webhook
const loadWebhookInfo = async () => {
  try {
    const [urlInfo, subsInfo] = await Promise.all([
      getWebhookUrl(),
      getWebhookSubscriptions(),
    ]);

    if (urlInfo) {
      webhookInfo.value = urlInfo;
    }

    if (subsInfo && subsInfo.subscriptions) {
      subscriptions.value = subsInfo.subscriptions;
    }
  } catch (e) {
    console.error("Failed to load webhook info", e);
  }
};

onMounted(async () => {
  await loadSettings();
  if (maxEnabled.value) {
    await loadWebhookInfo();
  }
});

// Сохранение настроек
const onSave = async () => {
  if (sending.value) return;
  if (!maxForm.value.bot_token) {
    errorHandler.showError(new Error("Заполни Bot Token"));
    return;
  }

  sending.value = true;
  progress.value = 0;

  try {
    const encryptedToken = encryptToken(maxForm.value.bot_token);
    const res = await saveMaxSettings({
      bot_token: encryptedToken,
      is_active: maxEnabled.value,
    });

    if (res) {
      // Обновляем информацию о webhook после сохранения
      await loadWebhookInfo();

      // Показываем сообщение о webhook
      if (res.webhook) {
        if (res.webhook.already_exists) {
          successHandler.showSuccess({
            data: {
              message: "Настройки сохранены. Webhook уже был зарегистрирован.",
            },
          });
        } else if (res.webhook.success) {
          successHandler.showSuccess({
            data: {
              message: `Настройки сохранены. Webhook зарегистрирован: ${res.webhook.url}`,
            },
          });
        }
      }
    }
  } catch (e) {
    errorHandler.showError(e);
  } finally {
    sending.value = false;
  }
};

// Проверка подключения
const onTest = async () => {
  if (sending.value) return;
  sending.value = true;
  progress.value = 0;

  try {
    const res = await testMaxConnection();
    if (res && res.success && res.bot_info) {
      successHandler.showSuccess({
        data: {
          message: `Подключение успешно! Бот: ${res.bot_info.name} (@${res.bot_info.username})`,
        },
      });
    }
  } catch (e) {
    errorHandler.showError(e);
  } finally {
    sending.value = false;
  }
};

// Перерегистрация webhook
const onReregisterWebhook = async () => {
  if (sending.value) return;
  sending.value = true;

  try {
    const res = await reregisterWebhook();
    if (res && res.success) {
      await loadWebhookInfo();
      successHandler.showSuccess({
        data: { message: "Webhook успешно перерегистрирован" },
      });
    }
  } catch (e) {
    errorHandler.showError(e);
  } finally {
    sending.value = false;
  }
};

// Удаление webhook
const onUnregisterWebhook = async () => {
  if (sending.value) return;

  if (!confirm("Вы уверены, что хотите удалить webhook?")) {
    return;
  }

  sending.value = true;

  try {
    const res = await unregisterWebhook();
    if (res && res.success) {
      await loadWebhookInfo();
      successHandler.showSuccess({
        data: { message: "Webhook успешно удален" },
      });
    }
  } catch (e) {
    errorHandler.showError(e);
  } finally {
    sending.value = false;
  }
};
</script>
