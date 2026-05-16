<template>
  <form class="grid gap-4">
    <!-- Основные поля формы -->
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-2">
        <Label for="first_name">Имя <span class="text-red-500">*</span></Label>
        <Input id="first_name" v-model="clientData.profile.first_name" placeholder="Введите имя"/>
<!--        <p v-if="errors.first_name" class="text-sm text-red-500">{{ errors.first_name }}</p>-->
      </div>
      <div class="space-y-2">
        <Label for="last_name">Фамилия <span class="text-red-500">*</span></Label>
        <Input id="last_name" v-model="clientData.profile.last_name" placeholder="Введите фамилию"/>
<!--        <p v-if="errors.last_name" class="text-sm text-red-500">{{ errors.last_name }}</p>-->
      </div>
    </div>

    <!-- Контактные данные -->
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-2">
        <Label for="email">Почта <span class="text-red-500">*</span></Label>
        <Input id="email" type="email" v-model="clientData.user.email" placeholder="example@mail.com"/>
<!--        <p v-if="errors.email" class="text-sm text-red-500">{{ errors.email }}</p>-->
      </div>
      <div class="space-y-2">
        <Label for="phone">Телефон</Label>
        <Input type="text" placeholder="Телефон" v-model="clientData.profile.phone" />
<!--        <p v-if="errors.phone" class="text-sm text-red-500">{{ errors.phone }}</p>-->
      </div>
    </div>

    <!-- Адрес -->
    <div class="space-y-2">
      <Label for="address">Адрес</Label>
      <Input id="address" v-model="clientData.profile.address" placeholder="Введите адрес"/>
<!--      <p v-if="errors.address" class="text-sm text-red-500">{{ errors.address }}</p>-->
    </div>

    <!-- Поля клиента -->
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-2">
        <Label for="level_id">Уровень клиента</Label>
        <Select v-model="clientData.client_level_id">
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
            v-model="clientData.bonus_balance"
            placeholder="0.00"
            min="0"
            step="0.01"
        />
<!--        <p v-if="errors.bonus_balance" class="text-sm text-red-500">{{ errors.bonus_balance }}</p>-->
      </div>
    </div>

  </form>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { toast } from 'vue-sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import axios from 'axios'
import { Client } from '@/models/client/Client'

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


const errors = ref<Record<string, string>>({})
const loading = ref(false)
const clientLevels = ref<ClientLevel[]>([])



// Загрузка уровней клиентов
onMounted(async () => {
  try {
    const response = await axios.get('/client-levels')
    clientLevels.value = response.data.data
  } catch (error) {
    console.error('Error loading client levels:', error)
    toast.error('Не удалось загрузить уровни клиентов')
  }
})


</script>