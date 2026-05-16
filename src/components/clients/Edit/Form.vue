<template>
  <form class="grid gap-4">
    <!-- Основные поля формы -->
    <div class="grid grid-cols-3 gap-3">
      <div class="space-y-2">
        <Label for="last_name">Фамилия <span class="text-red-500">*</span></Label>
        <Input id="last_name" v-model="clientData.profile.last_name" placeholder="Введите фамилию"/>
      </div>
      <div class="space-y-2">
        <Label for="first_name">Имя <span class="text-red-500">*</span></Label>
        <Input id="first_name" v-model="clientData.profile.first_name" placeholder="Введите имя"/>
      </div>
      <div class="space-y-2">
        <Label for="middle_name">Отчество</Label>
        <Input id="middle_name" v-model="clientData.profile.middle_name" placeholder="Введите отчество"/>
      </div>
    </div>

    <!-- Контактные данные -->
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-2">
        <Label for="email">Почта <span class="text-red-500">*</span></Label>
        <Input id="email" type="email" v-model="clientData.email" placeholder="example@mail.com"/>
      </div>
      <div class="space-y-2">
        <Label for="phone">Телефон</Label>
        <Input id="phone" type="text" placeholder="Телефон" v-model="clientData.profile.phone"/>
      </div>
    </div>

    <!-- Дата рождения -->
    <div class="space-y-2">
      <Label for="birthday">Дата рождения</Label>
      <DatePicker v-model="clientData.profile.birthday"/>
    </div>

    <!-- Адрес: общий -->
    <div class="space-y-2">
      <Label for="address">Адрес (одной строкой)</Label>
      <Input id="address" v-model="clientData.profile.address" placeholder="Введите адрес"/>
    </div>

    <!-- Адрес: разложенный -->
    <fieldset class="rounded border p-3 space-y-3">
      <legend class="px-1 text-xs uppercase text-gray-500">Адрес доставки</legend>

      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-2">
          <Label for="delivery_region">Регион</Label>
          <Input id="delivery_region" v-model="clientData.profile.delivery_region" placeholder="Регион / область"/>
        </div>
        <div class="space-y-2">
          <Label for="delivery_postal_code">Почтовый индекс</Label>
          <Input id="delivery_postal_code" v-model="clientData.profile.delivery_postal_code" placeholder="123456"/>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div class="space-y-2 col-span-2">
          <Label for="delivery_street">Улица</Label>
          <Input id="delivery_street" v-model="clientData.profile.delivery_street" placeholder="Улица"/>
        </div>
        <div class="space-y-2">
          <Label for="delivery_house">Дом</Label>
          <Input id="delivery_house" v-model="clientData.profile.delivery_house" placeholder="Дом"/>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-2">
          <Label for="delivery_apartment">Квартира</Label>
          <Input id="delivery_apartment" v-model="clientData.profile.delivery_apartment" placeholder="Квартира"/>
        </div>
      </div>
    </fieldset>

    <!-- Маркетинговые сегменты -->
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-2">
        <Label for="group_name">Группа</Label>
        <Input id="group_name" v-model="clientData.group_name" placeholder="Группа клиента"/>
      </div>
      <div class="space-y-2">
        <Label for="rfm_segment">RFM</Label>
        <Input id="rfm_segment" v-model="clientData.rfm_segment" placeholder="Например: CAA"/>
      </div>
    </div>

    <!-- Согласия и подписки -->
    <fieldset class="rounded border p-3 space-y-2">
      <legend class="px-1 text-xs uppercase text-gray-500">Согласия и подписки</legend>

      <div class="flex items-center space-x-2">
        <Checkbox id="subscribed_to_newsletter" v-model="clientData.subscribed_to_newsletter"/>
        <label for="subscribed_to_newsletter" class="text-sm leading-none">
          Подписан на новости / рассылку
        </label>
      </div>

      <div class="flex items-center space-x-2">
        <Checkbox id="personal_data_consent" v-model="clientData.personal_data_consent"/>
        <label for="personal_data_consent" class="text-sm leading-none">
          Согласие на обработку персональных данных
        </label>
      </div>

      <div class="flex items-center space-x-2">
        <Checkbox id="messenger_subscription" v-model="clientData.messenger_subscription"/>
        <label for="messenger_subscription" class="text-sm leading-none">
          Получать уведомления о заказе
        </label>
      </div>
    </fieldset>

  </form>
</template>

<script setup lang="ts">
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Checkbox} from '@/components/ui/checkbox'
import {Client} from '@/models/client/Client'
import DatePicker from "@/components/dynamics/DatePicker.vue";

const props = defineProps({
  clientId: {
    type: Number,
    default: null
  },
  clientData: {
    type: Object as () => Client | null,
    default: null
  }
})

const emit = defineEmits(['submit'])
</script>
