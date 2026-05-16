<template>
  <div class="space-y-6 p-6 max-w-4xl mx-auto">
    <div>
      <h1 class="text-2xl font-bold">Настройки платежей</h1>
      <p class="text-muted-foreground">Управление интеграциями с платежными системами</p>
    </div>

    <Separator />

    <!-- Robokassa -->
    <Card>
      <CardHeader>
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-md bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white">
            <span class="font-bold">R</span>
          </div>
          <div class="flex-1 flex justify-between items-center">
            <div>
              <CardTitle>Robokassa</CardTitle>
              <CardDescription>Настройки интеграции с Robokassa</CardDescription>
            </div>
            <Switch v-model="paymentsEnabled.robokassa" />
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4" :class="{'opacity-50': !paymentsEnabled.robokassa}">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="robokassa-shop-id">Shop ID</Label>
            <Input id="robokassa-shop-id" v-model="payments.robokassa.shopId" placeholder="Введите ваш Shop ID" :disabled="!paymentsEnabled.robokassa"/>
          </div>
          <div class="space-y-2">
            <Label for="robokassa-api-key">API Key</Label>
            <Input id="robokassa-api-key" v-model="payments.robokassa.apiKey" type="password" placeholder="Введите ваш API ключ" :disabled="!paymentsEnabled.robokassa"/>
          </div>
        </div>
        <div class="space-y-2">
          <Label for="robokassa-coupon">Промокод</Label>
          <div class="flex gap-2 max-md:flex-wrap">
            <Input id="robokassa-coupon" v-model="payments.robokassa.coupon" placeholder="Coupon+ITb" :disabled="!paymentsEnabled.robokassa"/>
            <Button class="max-md:w-full" @click="applyCoupon('robokassa')" :disabled="!paymentsEnabled.robokassa">Сохранить</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- CloudPayments -->
    <Card>
      <CardHeader>
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white">
            <span class="font-bold">C</span>
          </div>
          <div class="flex-1 flex justify-between items-center">
            <div>
              <CardTitle>CloudPayments</CardTitle>
              <CardDescription>Настройки интеграции с CloudPayments</CardDescription>
            </div>
            <Switch v-model="paymentsEnabled.cloudpayments" />
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4" :class="{'opacity-50': !paymentsEnabled.cloudpayments}">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="cloudpayments-shop-id">Shop ID</Label>
            <Input id="cloudpayments-shop-id" v-model="payments.cloudpayments.shopId" placeholder="Введите ваш Shop ID" :disabled="!paymentsEnabled.cloudpayments"/>
          </div>
          <div class="space-y-2">
            <Label for="cloudpayments-api-key">API Key</Label>
            <Input id="cloudpayments-api-key" v-model="payments.cloudpayments.apiKey" type="password" placeholder="Введите ваш API ключ" :disabled="!paymentsEnabled.cloudpayments"/>
          </div>
        </div>
        <div class="space-y-2">
          <Label for="cloudpayments-coupon">Промокод</Label>
          <div class="flex gap-2 max-md:flex-wrap">
            <Input id="cloudpayments-coupon" v-model="payments.cloudpayments.coupon" placeholder="Coupon+ITb" :disabled="!paymentsEnabled.cloudpayments"/>
            <Button class="max-md:w-full" @click="applyCoupon('cloudpayments')" :disabled="!paymentsEnabled.cloudpayments">Сохранить</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Яндекс.Касса -->
    <Card>
      <CardHeader>
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-md bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center text-white">
            <span class="font-bold">Я</span>
          </div>
          <div class="flex-1 flex justify-between items-center">
            <div>
              <CardTitle>Яндекс.Касса</CardTitle>
              <CardDescription>Настройки интеграции с Яндекс.Кассой</CardDescription>
            </div>
            <Switch v-model="paymentsEnabled.yandex" />
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4" :class="{'opacity-50': !paymentsEnabled.yandex}">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="yandex-shop-id">Shop ID</Label>
            <Input id="yandex-shop-id" v-model="payments.yandex.shopId" placeholder="Введите ваш Shop ID" :disabled="!paymentsEnabled.yandex"/>
          </div>
          <div class="space-y-2">
            <Label for="yandex-api-key">API Key</Label>
            <Input id="yandex-api-key" v-model="payments.yandex.apiKey" type="password" placeholder="Введите ваш API ключ" :disabled="!paymentsEnabled.yandex"/>
          </div>
        </div>
        <div class="space-y-2">
          <Label for="yandex-coupon">Промокод</Label>
          <div class="flex gap-2 max-md:flex-wrap">
            <Input id="yandex-coupon" v-model="payments.yandex.coupon" placeholder="Coupon+ITb" :disabled="!paymentsEnabled.yandex"/>
            <Button @click="applyCoupon('yandex')" :disabled="!paymentsEnabled.yandex" class="max-md:w-full">Сохранить</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- FreedomPay -->
    <Card>
      <CardHeader>
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
            <span class="font-bold">F</span>
          </div>
          <div class="flex-1 flex justify-between items-center">
            <div>
              <CardTitle>FreedomPay</CardTitle>
              <CardDescription>Настройки интеграции с FreedomPay</CardDescription>
            </div>
            <Switch v-model="paymentsEnabled.freedompay" />
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4" :class="{'opacity-50': !paymentsEnabled.freedompay}">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="freedompay-merchant-id">Merchant ID</Label>
            <Input id="freedompay-merchant-id" v-model="payments.freedompay.merchantId" placeholder="Введите ваш Merchant ID" :disabled="!paymentsEnabled.freedompay"/>
          </div>
          <div class="space-y-2">
            <Label for="freedompay-api-key">API Key</Label>
            <Input id="freedompay-api-key" v-model="payments.freedompay.apiKey" type="password" placeholder="Введите ваш API ключ" :disabled="!paymentsEnabled.freedompay"/>
          </div>
        </div>
        <div class="space-y-2">
          <Label for="freedompay-terminal-id">Terminal ID</Label>
          <Input id="freedompay-terminal-id" v-model="payments.freedompay.terminalId" placeholder="Введите Terminal ID" :disabled="!paymentsEnabled.freedompay"/>
        </div>
        <div class="space-y-2">
          <Label for="freedompay-coupon">Промокод</Label>
          <div class="flex gap-2 max-md:flex-wrap">
            <Input id="freedompay-coupon" v-model="payments.freedompay.coupon" placeholder="Coupon+ITb" :disabled="!paymentsEnabled.freedompay"/>
            <Button @click="applyCoupon('freedompay')" :disabled="!paymentsEnabled.freedompay" class="max-md:w-full">Сохранить</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { ref } from 'vue'

// Состояния включения/выключения платежных систем
const paymentsEnabled = ref({
  robokassa: true,
  cloudpayments: true,
  yandex: true,
  freedompay: false
})

// Данные платежных систем
const payments = ref({
  robokassa: {
    shopId: '',
    apiKey: '',
    coupon: ''
  },
  cloudpayments: {
    shopId: '',
    apiKey: '',
    coupon: ''
  },
  yandex: {
    shopId: '',
    apiKey: '',
    coupon: ''
  },
  freedompay: {
    merchantId: '',
    apiKey: '',
    terminalId: '',
    coupon: ''
  }
})

// Функция применения промокода
const applyCoupon = (paymentSystem: string) => {
  console.log(`Применяем промокод для ${paymentSystem}:`, payments.value[paymentSystem].coupon)
  // Здесь можно добавить логику применения промокода
}
</script>