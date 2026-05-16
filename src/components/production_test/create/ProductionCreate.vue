<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import DatePicker from "@/components/common/DatePicker.vue";
import BackButton from "@/components/BackButton.vue";

// Состояния формы
const form = ref({
  techCartId: '',
  quantity: 10,
  planned_start_date: new Date().toISOString().split('T')[0], // Формат YYYY-MM-DD
  notes: '',
  organization: 'Элект-03',
  start_time: '08:00',
  end_time: '17:00'
})

// Данные для формы
const techCarts = ref<any[]>([])
const selectedTechCart = ref<any>(null)
const isLoading = ref(false)
const error = ref('')

// Вычисляемое время производства
const productionDuration = computed(() => {
  if (!form.value.start_time || !form.value.end_time) return '00:00'

  const [startHours, startMinutes] = form.value.start_time.split(':').map(Number)
  const [endHours, endMinutes] = form.value.end_time.split(':').map(Number)

  let diffHours = endHours - startHours
  let diffMinutes = endMinutes - startMinutes

  if (diffMinutes < 0) {
    diffHours--
    diffMinutes += 60
  }

  return `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}`
})

// Загрузка техкарт
const fetchTechCarts = async () => {
  try {
    const { data } = await axios.get('/recipes')
    techCarts.value = data
  } catch (err) {
    error.value = 'Ошибка загрузки техкарт'
    console.error(err)
  }
}

// Загрузка данных техкарты при выборе
const fetchTechCartDetails = async (id: string) => {
  if (!id) return

  try {
    const { data } = await axios.get(`/production/create/${id}`)
    selectedTechCart.value = data
  } catch (err) {
    error.value = 'Ошибка загрузки техкарты'
    console.error(err)
  }
}

// Обработчик изменения даты
const handleDateSelect = (date: Date | undefined) => {
  if (date) {
    form.value.planned_start_date = format(date, 'yyyy-MM-dd')
  }
}

// Отправка формы
const onSubmit = async () => {
  try {
    isLoading.value = true
    await axios.post('/batches', {
      quantity: form.value.quantity,
      planned_start_date: form.value.planned_start_date,
      notes: form.value.notes,
      tech_cart_id: form.value.techCartId,
      start_time: form.value.start_time,
      end_time: form.value.end_time
    })
    // Редирект или уведомление об успехе
  } catch (err) {
    error.value = 'Ошибка создания задания'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchTechCarts()
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">

    <BackButton title="Производственное задание"/>

<!--    <h1 class="text-2xl font-bold mb-6">Производственное задание №</h1>-->

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-5 items-end">
      <div>
        <Label>Организация</Label>
        <div class="flex items-center gap-2 mt-1">
          <Input v-model="form.organization" disabled />
          <Button variant="outline">Выбрать</Button>
        </div>
      </div>

      <div>
        <Label>Планируемая дата производства</Label>
<!--        <Calendar-->
<!--            mode="single"-->
<!--            :selected="new Date(form.planned_start_date)"-->
<!--            @select="handleDateSelect"-->
<!--            class="mt-1 rounded-md border"-->
<!--        />-->
        <DatePicker placeholder="Выберите дату" v-model="form.planned_start_date"/>

      </div>
    </div>

    <div class="mb-8">
      <Label>Технологическая карта</Label>
      <Select
          v-model="form.techCartId"
          @update:model-value="fetchTechCartDetails"
      >
        <SelectTrigger class="mt-1">
          <SelectValue placeholder="Выберите техкарту" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
              v-for="techCart in techCarts"
              :key="techCart.id"
              :value="techCart.id"
          >
            {{ techCart.name }} ({{ techCart.code }})
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="mb-8" v-if="selectedTechCart">
      <h2 class="text-lg font-semibold mb-4">Продукция</h2>

      <div class="border rounded-lg p-4 mb-4">
        <h3 class="font-medium mb-2">Материалы</h3>
        <div class="text-sm text-gray-500">Выбранные материалы по техкарте</div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
          <tr class="bg-gray-50">
            <th class="p-2 text-left border">Код</th>
            <th class="p-2 text-left border">Наименование</th>
            <th class="p-2 text-left border">Готовые продукции</th>
            <th class="p-2 text-left border">Объем гр-ва</th>
            <th class="p-2 text-left border">Норма</th>
            <th class="p-2 text-left border">Запланировано</th>
            <th class="p-2 text-left border">Произведено</th>
          </tr>
          </thead>
          <tbody>
          <tr v-if="selectedTechCart">
            <td class="p-2 border">{{ selectedTechCart.code }}</td>
            <td class="p-2 border">{{ selectedTechCart.name }}</td>
            <td class="p-2 border">
              <Input type="number" v-model="form.quantity" min="1" />
            </td>
            <td class="p-2 border">-</td>
            <td class="p-2 border">-</td>
            <td class="p-2 border">-</td>
            <td class="p-2 border">-</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="mb-8">
      <Label>Комментарий</Label>
      <Textarea
          v-model="form.notes"
          class="mt-1"
          placeholder="Дополнительные заметки"
          rows="3"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div>
        <Label>Начало производства</Label>
        <Input type="time" v-model="form.start_time" class="mt-1" />
      </div>
      <div>
        <Label>Завершение производства</Label>
        <Input type="time" v-model="form.end_time" class="mt-1" />
      </div>
      <div>
        <Label>Время производства</Label>
        <Input :value="productionDuration" disabled class="mt-1" />
      </div>
    </div>

    <div class="flex justify-end gap-4">
<!--      <Button variant="outline">Отмена</Button>-->
      <Button @click="onSubmit" :disabled="isLoading">
        <span v-if="isLoading">Создание...</span>
        <span v-else>Создать задание</span>
      </Button>
    </div>

    <div v-if="error" class="mt-4 text-red-500">{{ error }}</div>
  </div>
</template>