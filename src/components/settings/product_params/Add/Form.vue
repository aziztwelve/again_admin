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
        <Input type="text" placeholder="Телефон" v-model="form.phone" />
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
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-2">
        <Label for="level_id">Уровень клиента</Label>
        <Select v-model="form.level_id">
          <SelectTrigger>
            <SelectValue placeholder="Выберите уровень" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem
                  v-for="level in clientLevels"
                  :key="level.id"
                  :value="level.id"
              >
                {{ level.name }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div class="space-y-2">
        <Label for="bonus_balance">Бонусный баланс</Label>
        <Input
            id="bonus_balance"
            type="number"
            v-model="form.bonus_balance"
            placeholder="0.00"
            min="0"
            step="0.01"
        />
        <p v-if="errors.bonus_balance" class="text-sm text-red-500">{{ errors.bonus_balance }}</p>
      </div>
    </div>

    <!-- Поля для пароля (только при создании) -->
    <template v-if="!clientId">
      <div class="space-y-2">
        <Label for="password">Пароль <span class="text-red-500">*</span></Label>
        <Input id="password" type="password" v-model="form.password" placeholder="Не менее 8 символов"/>
        <p v-if="errors.password" class="text-sm text-red-500">{{ errors.password }}</p>
      </div>

      <div class="space-y-2">
        <Label for="password_confirmation">Подтверждение пароля <span class="text-red-500">*</span></Label>
        <Input
            id="password_confirmation"
            type="password"
            v-model="form.password_confirmation"
            placeholder="Повторите пароль"
        />
      </div>
    </template>

    <!-- Кнопка отправки -->
    <Button type="submit" class="mt-2" :disabled="loading">
      <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin"/>
      {{ loading ? (clientId ? 'Обновление...' : 'Создание...') : (clientId ? 'Обновить клиента' : 'Создать клиента') }}
    </Button>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-vue-next'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { UserProfile } from '@/models/user/Profile'
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
  bonus_balance: '0',
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
        bonus_balance: client.bonus_balance,
        password: '',
        password_confirmation: ''
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

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  if (!form.value.first_name) {
    errors.value.first_name = 'Имя обязательно'
    isValid = false
  }

  if (!form.value.last_name) {
    errors.value.last_name = 'Фамилия обязательна'
    isValid = false
  }

  if (!form.value.email) {
    errors.value.email = 'Email обязателен'
    isValid = false
  } else if (!/^\S+@\S+\.\S+$/.test(form.value.email)) {
    errors.value.email = 'Некорректный email'
    isValid = false
  }

  if (!props.clientId) {
    if (!form.value.password) {
      errors.value.password = 'Пароль обязателен'
      isValid = false
    } else if (form.value.password.length < 8) {
      errors.value.password = 'Пароль должен быть не менее 8 символов'
      isValid = false
    }

    if (form.value.password !== form.value.password_confirmation) {
      errors.value.password_confirmation = 'Пароли не совпадают'
      isValid = false
    }
  }

  if (form.value.bonus_balance && isNaN(parseFloat(form.value.bonus_balance))) {
    errors.value.bonus_balance = 'Некорректное значение баланса'
    isValid = false
  }

  return isValid
}

const submitForm = async () => {
  if (!validateForm()) return

  try {
    loading.value = true
    const payload = {
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      email: form.value.email,
      phone: form.value.phone,
      address: form.value.address,
      level_id: form.value.level_id,
      bonus_balance: parseFloat(form.value.bonus_balance) || 0,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation
    }

    if (props.clientId) {
      await axios.put(`/clients/${props.clientId}`, payload)
      toast.success('Клиент успешно обновлен')
    } else {
      await axios.post('/clients', payload)
      toast.success('Клиент успешно создан')
    }

    emit('submit')
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