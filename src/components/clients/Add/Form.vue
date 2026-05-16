<template>
  <form @submit.prevent="submitForm" class="grid gap-4">
    <!-- Основные поля формы -->
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-2">
        <Label for="first_name">Имя <span class="text-red-500">*</span></Label>
        <Input id="first_name" v-model="form.first_name" placeholder="Введите имя"/>
        <p v-if="errors.first_name" class="text-sm text-red-500">{{ errors.first_name }}</p>
      </div>
      <div class="space-y-2">
        <Label for="last_name">Фамилия <span class="text-red-500">*</span></Label>
        <Input id="last_name" v-model="form.last_name" placeholder="Введите фамилию"/>
        <p v-if="errors.last_name" class="text-sm text-red-500">{{ errors.last_name }}</p>
      </div>
    </div>

    <!-- Контактные данные -->
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-2">
        <Label for="email">Почта <span class="text-red-500">*</span></Label>
        <Input id="email" type="email" v-model="form.email" placeholder="example@mail.com"/>
        <p v-if="errors.email" class="text-sm text-red-500">{{ errors.email }}</p>
      </div>
      <div class="space-y-2">
        <Label for="phone">Телефон</Label>
        <Input type="text" placeholder="Телефон" v-model="form.phone"/>
        <p v-if="errors.phone" class="text-sm text-red-500">{{ errors.phone }}</p>
      </div>
    </div>

    <!-- Адрес -->
    <div class="space-y-2">
      <Label for="address">Адрес</Label>
      <Input id="address" v-model="form.address" placeholder="Введите адрес"/>
      <p v-if="errors.address" class="text-sm text-red-500">{{ errors.address }}</p>
    </div>

    <!-- Поля клиента -->
    <div class="">


      <Label for="birthday">Дата рождения</Label>
      <DatePicker v-model="form.birthday"/>

    </div>


    <!-- Кнопка отправки -->
    <Button type="submit" class="mt-2" :disabled="loading">
      <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin"/>
      {{ loading ? (clientId ? 'Обновление...' : 'Создание...') : (clientId ? 'Обновить клиента' : 'Создать клиента') }}
    </Button>
  </form>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {toast} from 'vue-sonner'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import DatePicker from '@/components/dynamics/DatePicker.vue'
import {Loader2} from 'lucide-vue-next'

import axios from 'axios'
import {Client} from "@/models/client/Client";

interface ClientLevel {
  id: number
  name: string
}

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

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  level_id: null as number | null,
  birthday: undefined,
  password: '',
  password_confirmation: ''
})

const errors = ref<Record<string, string>>({})
const loading = ref(false)
const clientLevels = ref<ClientLevel[]>([])

// Загрузка данных при редактировании
onMounted(async () => {
  if (props.clientId) {
    try {
      loading.value = true
      const response = await axios.get(`/clients/${props.clientId}`)
      const client = Client.fromJSON(response.data.client)

      form.value = {
        first_name: client.user?.profile?.first_name || '',
        last_name: client.user?.profile?.last_name || '',
        email: client.user?.email || '',
        phone: client.profile?.phone || '',
        address: client.profile?.address || '',
        level_id: client.client_level_id,
        birthday: client.profile?.birthday,

      }
    } catch (error) {
      toast.error('Ошибка загрузки данных клиента')
    } finally {
      loading.value = false
    }
  }

  // Загрузка уровней клиентов
  try {
    const response = await axios.get('/client-levels')
    clientLevels.value = response.data.data
  } catch (error) {
    console.error('Error loading client levels:', error)
  }
})


const submitForm = async () => {


  try {
    loading.value = true
    const payload = {
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      email: form.value.email,
      phone: form.value.phone,
      address: form.value.address,
      level_id: form.value.level_id,
      birthday: form.value.birthday ?? null,

    }

    if (props.clientId) {
      await axios.put(`/clients/${props.clientId}`, payload)
      toast.success('Клиент успешно обновлен')
      emit('submit', payload)

    } else {
      await axios.post('/clients', payload)
      toast.success('Клиент успешно создан')
      emit('submit', payload)

    }

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors
      } else {
        toast.error(error.response.data.message || 'Произошла ошибка')
      }
    } else {
      toast.error('Неизвестная ошибка')
      console.error(error)
    }
  } finally {
    loading.value = false
  }
}


</script>