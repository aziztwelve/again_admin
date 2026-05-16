<template>
  <div class="space-y-6 p-6 max-w-4xl mx-auto">
    <div>
      <h1 class="text-2xl font-bold">Настройки кассовых чеков</h1>
      <p class="text-muted-foreground">Управление фискализацией и интеграциями с ОФД</p>
    </div>

    <Separator />

    <!-- OFD Ферма -->
    <Card>
      <CardHeader>
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-md bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="flex-1 flex justify-between items-center">
            <div>
              <CardTitle>OFD Ферма</CardTitle>
              <CardDescription>Фискализация чеков через ОФД Ферма</CardDescription>
            </div>
            <Switch v-model="ofdEnabled" />
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4" :class="{'opacity-50': !ofdEnabled}">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="ofd-inn">ИНН организации</Label>
            <Input id="ofd-inn" v-model="ofdData.inn" placeholder="Введите ИНН" :disabled="!ofdEnabled" />
          </div>
          <div class="space-y-2">
            <Label for="ofd-api-key">API Ключ</Label>
            <Input id="ofd-api-key" v-model="ofdData.apiKey" type="password" placeholder="Введите API ключ" :disabled="!ofdEnabled" />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="kkt-id">ID Кассы</Label>
            <Input id="kkt-id" v-model="ofdData.kktId" placeholder="Введите ID кассы" :disabled="!ofdEnabled" />
          </div>
          <div class="space-y-2">
            <Label for="fn-number">Номер ФН</Label>
            <Input id="fn-number" v-model="ofdData.fnNumber" placeholder="Введите номер ФН" :disabled="!ofdEnabled" />
          </div>
        </div>
        <div class="space-y-2">
          <Label for="ofd-server">URL сервера ОФД</Label>
          <Input id="ofd-server" v-model="ofdData.serverUrl" placeholder="https://api.ofd.ru" :disabled="!ofdEnabled" />
        </div>
        <div class="flex justify-end pt-2">
          <Button @click="saveOfdSettings" :disabled="!ofdEnabled" class="max-md:w-full">
            Сохранить
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Дополнительные настройки чеков -->
    <Card>
      <CardHeader>
        <CardTitle>Параметры чеков</CardTitle>
        <CardDescription>Настройка формирования кассовых чеков</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center space-x-2">
          <Switch id="email-receipts" v-model="receiptSettings.emailEnabled" />
          <Label for="email-receipts">Отправлять чеки на email</Label>
        </div>
        <div class="flex items-center space-x-2">
          <Switch id="sms-receipts" v-model="receiptSettings.smsEnabled" />
          <Label for="sms-receipts">Отправлять чеки по SMS</Label>
        </div>
        <div class="space-y-2">
          <Label for="receipt-template">Шаблон чека</Label>
          <Textarea
              class="min-h-[100px]"
              id="receipt-template"
              v-model="receiptSettings.template"
              placeholder="Введите шаблон чека..."
          />
        </div>
        <div class="flex justify-end pt-2">
          <Button @click="saveReceiptSettings" class="max-md:w-full">
            Сохранить
          </Button>
        </div>
      </CardContent>
    </Card>


  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toast } from '@/components/ui/toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

const ofdEnabled = ref(true)
const ofdData = ref({
  inn: '',
  apiKey: '',
  kktId: '',
  fnNumber: '',
  serverUrl: 'https://api.ofd.ru'
})

const receiptSettings = ref({
  emailEnabled: true,
  smsEnabled: false,
  template: 'Чек №{number} от {date}\n{items}\nИтого: {total} руб.'
})

const saveOfdSettings = async () => {
  try {
    // Здесь будет API запрос для сохранения настроек OFD
    toast({
      title: 'Настройки OFD сохранены',
      description: 'Параметры успешно обновлены',
      variant: 'success'
    })
  } catch (error) {
    toast({
      title: 'Ошибка сохранения',
      description: 'Не удалось сохранить настройки OFD',
      variant: 'destructive'
    })
  }
}

const saveReceiptSettings = async () => {
  try {
    // Здесь будет API запрос для сохранения настроек чеков
    toast({
      title: 'Параметры чеков сохранены',
      description: 'Настройки успешно обновлены',
      variant: 'success'
    })
  } catch (error) {
    toast({
      title: 'Ошибка сохранения',
      description: 'Не удалось сохранить параметры чеков',
      variant: 'destructive'
    })
  }
}

const saveAllSettings = async () => {
  try {
    await Promise.all([saveOfdSettings(), saveReceiptSettings()])
    toast({
      title: 'Все изменения сохранены',
      description: 'Настройки кассовых чеков обновлены',
      variant: 'success'
    })
  } catch (error) {
    toast({
      title: 'Ошибка сохранения',
      description: 'Не удалось сохранить все настройки',
      variant: 'destructive'
    })
  }
}
</script>