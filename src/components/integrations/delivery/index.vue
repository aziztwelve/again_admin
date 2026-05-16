<template>
  <div class="space-y-6 p-6 max-w-4xl mx-auto">
    <div>
      <h1 class="text-2xl font-bold">Настройки доставки</h1>
      <p class="text-muted-foreground">Интеграция с сервисами доставки</p>
    </div>

    <Separator/>

    <!-- СДЭК -->
    <Card>
      <CardHeader>
        <div class="flex items-center space-x-3">
          <div
              class="w-10 h-10 rounded-md bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                  d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.7 1.3 3 3 3s3-1.3 3-3h6c0 1.7 1.3 3 3 3s3-1.3 3-3h2v-5l-3-4zM6 18.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm9-3.5H8.2c-.5-.6-1.3-1-2.2-1H3V6h12v9zm3 3.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zM17 12V8h2l2 2.5L17 12z"/>
            </svg>
          </div>
          <div class="flex-1 flex justify-between items-center">
            <div>
              <CardTitle>СДЭК</CardTitle>
              <CardDescription>Интеграция с API СДЭК</CardDescription>
            </div>
            <Switch v-model="deliveryEnabled.cdek"/>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4" :class="{'opacity-50': !deliveryEnabled.cdek}">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="cdek-account">Аккаунт</Label>
            <Input id="cdek-account" v-model="deliveryData.cdek.account" placeholder="Введите логин"
                   :disabled="!deliveryEnabled.cdek"/>
          </div>
          <div class="space-y-2">
            <Label for="cdek-secure">Secure password</Label>
            <Input id="cdek-secure" v-model="deliveryData.cdek.securePassword" type="password"
                   placeholder="Введите secure password" :disabled="!deliveryEnabled.cdek"/>
          </div>
        </div>
        <div class="space-y-2">
          <Label for="cdek-tariffs">Тарифы (через запятую)</Label>
          <Input id="cdek-tariffs" v-model="deliveryData.cdek.tariffs" placeholder="136,137,233"
                 :disabled="!deliveryEnabled.cdek"/>
        </div>


        <Button>Сохранить</Button>


      </CardContent>


    </Card>

    <!-- Яндекс.доставка  -->
    <Card>
      <CardHeader>
        <div class="flex items-center space-x-3">
          <div
              class="w-10 h-10 rounded-md bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white">
            <span class="font-bold">Я</span>
          </div>
          <div class="flex-1 flex justify-between items-center">
            <div>
              <CardTitle>Яндекс доставка </CardTitle>
              <CardDescription>Интеграция с API Яндекс.доставка </CardDescription>
            </div>
            <Switch v-model="deliveryEnabled.boxberry"/>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4" :class="{'opacity-50': !deliveryEnabled.boxberry}">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="boxberry-token">API Token</Label>
            <Input id="boxberry-token" v-model="deliveryData.boxberry.token" type="password"
                   placeholder="Введите API токен" :disabled="!deliveryEnabled.boxberry"/>
          </div>
          <div class="space-y-2">
            <Label for="boxberry-widget">Код виджета</Label>
            <Input id="boxberry-widget" v-model="deliveryData.boxberry.widgetCode" placeholder="Введите код виджета"
                   :disabled="!deliveryEnabled.boxberry"/>
          </div>
        </div>
        <div class="space-y-2">
          <Label for="boxberry-url">URL API</Label>
          <Input id="boxberry-url" v-model="deliveryData.boxberry.apiUrl" placeholder="Введите url"
                 :disabled="!deliveryEnabled.boxberry"/>
        </div>

        <Button>Сохранить</Button>


      </CardContent>


    </Card>

    <!-- Почта России -->
    <Card>
      <CardHeader>
        <div class="flex items-center space-x-3">
          <div
              class="w-10 h-10 rounded-md bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                  d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
            </svg>
          </div>
          <div class="flex-1 flex justify-between items-center">
            <div>
              <CardTitle>Почта России</CardTitle>
              <CardDescription>Интеграция с API Почты России</CardDescription>
            </div>
            <Switch v-model="deliveryEnabled.russianPost"/>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4" :class="{'opacity-50': !deliveryEnabled.russianPost}">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="post-login">Логин</Label>
            <Input id="post-login" v-model="deliveryData.russianPost.login" placeholder="Введите логин"
                   :disabled="!deliveryEnabled.russianPost"/>
          </div>
          <div class="space-y-2">
            <Label for="post-password">Пароль</Label>
            <Input id="post-password" v-model="deliveryData.russianPost.password" type="password"
                   placeholder="Введите пароль" :disabled="!deliveryEnabled.russianPost"/>
          </div>
        </div>
        <div class="space-y-2">
          <Label for="post-token">Token</Label>
          <Input id="post-token" v-model="deliveryData.russianPost.token" type="password"
                 placeholder="Введите токен доступа" :disabled="!deliveryEnabled.russianPost"/>
        </div>
        <Button>Сохранить</Button>

      </CardContent>


    </Card>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Switch} from '@/components/ui/switch'
import {Separator} from '@/components/ui/separator'
import {Button} from '@/components/ui/button'

const deliveryEnabled = ref({
  cdek: true,
  boxberry: true,
  russianPost: true
})

const deliveryData = ref({
  cdek: {
    account: '',
    securePassword: '',
    tariffs: '136,137,233'
  },
  boxberry: {
    token: '',
    widgetCode: '',
    apiUrl: ''
  },
  russianPost: {
    login: '',
    password: '',
    token: ''
  }
})
</script>