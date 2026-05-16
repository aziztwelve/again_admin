<template>
  <ModalWithProgressBar :sending="sending" :target-progress="progress" />

  <div class="space-y-6 p-6 max-w-4xl mx-auto">
    <!-- Заголовок раздела -->
    <div>
      <h1 class="text-2xl font-bold">Интеграция мессенджеров</h1>
      <p class="text-muted-foreground">
        Настройте подключение WhatsApp и Telegram API
      </p>
    </div>

    <Separator />

    <!-- WhatsApp API -->
    <WhatsAppSettings />

    <!-- Telegram Bot API -->
    <Card>
      <CardHeader>
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 rounded-md bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"
              />
            </svg>
          </div>
          <div class="flex-1 flex justify-between items-center">
            <div>
              <CardTitle>Telegram Bot API</CardTitle>
              <CardDescription>Настройки Telegram бота</CardDescription>
            </div>
            <Switch v-model="integrations.telegram.enabled" />
          </div>
        </div>
      </CardHeader>
      <CardContent
        class="space-y-4"
        :class="{ 'opacity-50': !integrations.telegram.enabled }"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="telegram-bot-name">Имя бота</Label>
            <Input
              id="telegram-bot-name"
              v-model="integrations.telegram.botName"
              placeholder="MyCompanyBot"
              :disabled="!integrations.telegram.enabled"
            />
          </div>
          <div class="space-y-2">
            <Label for="telegram-token">Токен бота</Label>
            <Input
              id="telegram-token"
              v-model="integrations.telegram.apiToken"
              type="password"
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              :disabled="!integrations.telegram.enabled"
            />
          </div>
        </div>

        <div
          class="flex flex-wrap justify-between max-md:space-y-2 pt-4 border-t"
        >
          <Button
            class="max-md:w-full"
            :disabled="!integrations.telegram.enabled || !hasTelegramChanges"
            @click="saveTelegram"
          >
            Сохранить
          </Button>
        </div>
      </CardContent>
    </Card>

    <VKSettings />

    <MaxSettings />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { toast } from "@/components/ui/toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useTelegramFunctions } from "@/composables/useTelegramFunctions";
import ModalWithProgressBar from "@/components/dynamics/ModalWithProgressBar.vue";
import { encryptToken } from "@/utils/crypto";
import VKSettings from "@/features/vk/components/VKSettings.vue";
import WhatsAppSettings from "@/features/whatsapp/components/WhatsAppSettings.vue";
import MaxSettings from "@/features/max/components/MaxSettings.vue";

// Состояния интеграций
const initialData = {
  whatsapp: {
    enabled: true,
    phoneNumber: "",
    apiToken: "",
    webhookUrl: "",
  },
  telegram: {
    enabled: true,
    botName: "",
    apiToken: "",
    chatId: "",
    webhookUrl: "",
  },
};

const integrations = ref(JSON.parse(JSON.stringify(initialData)));
const savedData = ref(JSON.parse(JSON.stringify(initialData)));

// Вычисляемые свойства для изменений
const hasWhatsAppChanges = computed(() => {
  return (
    JSON.stringify(integrations.value.whatsapp) !==
    JSON.stringify(savedData.value.whatsapp)
  );
});

const hasTelegramChanges = computed(() => {
  return (
    JSON.stringify(integrations.value.telegram) !==
    JSON.stringify(savedData.value.telegram)
  );
});

const hasChanges = computed(() => {
  return hasWhatsAppChanges.value || hasTelegramChanges.value;
});

const { updateTelegramSettings, sending, progress } = useTelegramFunctions();

const saveTelegram = async () => {
  const telega = integrations.value.telegram;

  const encryptedToken = encryptToken(telega.apiToken);
  const result = await updateTelegramSettings({
    bot_name: telega.botName,
    token: encryptedToken,
  });
};

// Методы для WhatsApp
const testWhatsAppConnection = async () => {
  try {
    // Здесь будет API запрос для проверки подключения
    toast({
      title: "Проверка подключения WhatsApp",
      description: "Соединение успешно установлено",
      variant: "success",
    });
  } catch (error) {
    toast({
      title: "Ошибка подключения",
      description: error.message || "Не удалось подключиться к WhatsApp API",
      variant: "destructive",
    });
  }
};

const saveWhatsApp = async () => {
  try {
    // Здесь будет API запрос для сохранения
    savedData.value.whatsapp = JSON.parse(
      JSON.stringify(integrations.value.whatsapp),
    );
    toast({
      title: "WhatsApp сохранен",
      description: "Настройки успешно обновлены",
      variant: "success",
    });
  } catch (error) {
    toast({
      title: "Ошибка сохранения",
      description: error.message || "Не удалось сохранить настройки WhatsApp",
      variant: "destructive",
    });
  }
};

// Методы для Telegram
const testTelegramConnection = async () => {
  try {
    // Здесь будет API запрос для проверки подключения
    toast({
      title: "Проверка подключения Telegram",
      description: "Бот успешно подключен",
      variant: "success",
    });
  } catch (error) {
    toast({
      title: "Ошибка подключения",
      description:
        error.message || "Не удалось подключиться к Telegram Bot API",
      variant: "destructive",
    });
  }
};

const sendTestMessage = async () => {
  try {
    // Здесь будет API запрос для отправки тестового сообщения
    toast({
      title: "Тестовое сообщение отправлено",
      description: "Проверьте ваш Telegram чат",
      variant: "success",
    });
  } catch (error) {
    toast({
      title: "Ошибка отправки",
      description: error.message || "Не удалось отправить тестовое сообщение",
      variant: "destructive",
    });
  }
};

// Общие методы
const saveAll = async () => {
  try {
    await Promise.all([saveWhatsApp(), saveTelegram()]);
    toast({
      title: "Все изменения сохранены",
      description: "Настройки мессенджеров обновлены",
      variant: "success",
    });
  } catch (error) {
    toast({
      title: "Ошибка сохранения",
      description: error.message || "Не удалось сохранить все настройки",
      variant: "destructive",
    });
  }
};

const resetChanges = () => {
  integrations.value = JSON.parse(JSON.stringify(savedData.value));
  toast({
    title: "Изменения сброшены",
    description: "Все несохраненные изменения отменены",
    variant: "default",
  });
};
</script>
