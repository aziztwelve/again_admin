<template>
  <Spinner v-if="isLoading"/>
  <form v-else class="space-y-4" @submit.prevent="emit('submitForm')">
    <!-- Email -->
    <div class="space-y-1">
      <Label for="email">Email <span class="text-red-500">*</span></Label>
      <Input id="email" type="email" v-model="form.email" placeholder="example@mail.com" required/>
    </div>

    <!-- Имя / Фамилия / Отчество -->
    <div class="grid gap-2 md:grid-cols-3">
      <div class="space-y-1">
        <Label for="first_name">Имя <span class="text-red-500">*</span></Label>
        <Input id="first_name" v-model="form.first_name" placeholder="Иван" required/>
      </div>
      <div class="space-y-1">
        <Label for="last_name">Фамилия <span class="text-red-500">*</span></Label>
        <Input id="last_name" v-model="form.last_name" placeholder="Иванов" required/>
      </div>
      <div class="space-y-1">
        <Label for="middle_name">Отчество</Label>
        <Input id="middle_name" v-model="form.middle_name" placeholder="Иванович"/>
      </div>
    </div>

    <!-- Телефон / День рождения -->
    <div class="grid gap-2 md:grid-cols-2">
      <div class="space-y-1">
        <Label for="phone">Телефон</Label>
        <Input id="phone" type="tel" v-model="form.phone" placeholder="+7 XXX XXX XXXX"/>
      </div>
      <div class="space-y-1">
        <Label for="birthday">День рождения</Label>
        <DatePicker v-model="form.birthday" placeholder="Выберите дату"/>
      </div>
    </div>

    <!-- Адрес (одна строка) -->
    <div class="space-y-1">
      <Label for="address">Адрес</Label>
      <Textarea id="address" v-model="form.address" placeholder="Улица, дом, квартира..." :rows="2"/>
    </div>

    <!-- Страна / Регион / Город -->
    <div class="grid gap-2 md:grid-cols-3">
      <div class="space-y-1">
        <Label>Страна</Label>
        <Select
            v-model="form.delivery_country_id"
            :options="countries"
            option-value="id"
            option-label="name"
            placeholder="Выберите страну"
            :searchable="true"
            search-placeholder="Поиск..."
            title=""
        />
      </div>
      <div class="space-y-1">
        <Label for="delivery_region">Регион</Label>
        <Input
            id="delivery_region"
            v-model="form.delivery_region"
            placeholder="Например, Свердловская область"
        />
      </div>
      <div class="space-y-1">
        <Label>Город</Label>
        <Select
            v-model="form.delivery_city_id"
            :options="cities"
            option-value="id"
            option-label="name"
            :placeholder="form.delivery_country_id != null ? 'Выберите город' : 'Сначала выберите страну'"
            :searchable="true"
            search-placeholder="Поиск..."
            :disabled="form.delivery_country_id == null"
            title=""
        />
      </div>
    </div>

    <!-- Улица / Дом / Квартира / Индекс -->
    <div class="grid gap-2 md:grid-cols-4">
      <div class="space-y-1">
        <Label for="delivery_street">Улица</Label>
        <Input id="delivery_street" v-model="form.delivery_street" placeholder="ул. Ленина"/>
      </div>
      <div class="space-y-1">
        <Label for="delivery_house">Дом</Label>
        <Input id="delivery_house" v-model="form.delivery_house" placeholder="12А"/>
      </div>
      <div class="space-y-1">
        <Label for="delivery_apartment">Квартира</Label>
        <Input id="delivery_apartment" v-model="form.delivery_apartment" placeholder="34"/>
      </div>
      <div class="space-y-1">
        <Label for="delivery_postal_code">Индекс</Label>
        <Input id="delivery_postal_code" v-model="form.delivery_postal_code" placeholder="620000"/>
      </div>
    </div>

    <Button type="submit" class="mt-4 w-full" variant="secondary">
      {{ submitButtonText }}
    </Button>
  </form>
</template>

<script setup lang="ts">
import {ref, onMounted, watch, computed} from 'vue'
import axios from 'axios'
import {Input} from '@/components/ui/input'
import {Textarea} from '@/components/ui/textarea'
import {Label} from '@/components/ui/label'
import {Button} from '@/components/ui/button'
import {Spinner} from "@/components/ui/spinner"
import DatePicker from '@/components/dynamics/DatePicker.vue'
import Select from '@/components/dynamics/Dropdown/Select.vue'
import type {ClientFormData} from '@/types/client'

interface ClientFormFieldsProps {
  formData: ClientFormData
  showSubmitButton?: boolean
  submitButtonText?: string
}

const props = withDefaults(defineProps<ClientFormFieldsProps>(), {
  showSubmitButton: true,
  submitButtonText: 'Создать клиента',
})

const emit = defineEmits(['submitForm'])

const isLoading = ref<boolean>(true)
// Реактивная ссылка на formData (родитель её мутирует напрямую)
const form = computed(() => props.formData)

interface Country { id: number; name: string }
interface City { id: number; name: string; region_id?: number; country_id?: number }

const countries = ref<Country[]>([])
const cities = ref<City[]>([])

const loadCountries = async () => {
  try {
    const {data} = await axios.get('/countries')
    countries.value = Array.isArray(data?.countries) ? data.countries : []
  } catch (e) {
    countries.value = []
  }
}

const loadCities = async (countryId: number | null | undefined) => {
  // ВАЖНО: id страны может быть 0 (легаси «Россия» с id=0), поэтому проверяем
  // именно на null/undefined, а не на falsy.
  if (countryId == null) {
    cities.value = []
    return
  }
  try {
    const {data} = await axios.get('/countries/cities', {params: {country_id: countryId}})
    cities.value = Array.isArray(data?.cities) ? data.cities : []
  } catch (e) {
    cities.value = []
  }
}

// При смене страны — подгружаем города; если выбранный город не из этой страны — сбрасываем
watch(
    () => form.value.delivery_country_id,
    async (countryId, prev) => {
      await loadCities(countryId ?? null)
      if (prev !== undefined && prev !== countryId) {
        // Сбрасываем выбранный город только при ручной смене страны
        if (form.value.delivery_city_id && !cities.value.find(c => c.id === form.value.delivery_city_id)) {
          form.value.delivery_city_id = null
        }
      }
    }
)

onMounted(async () => {
  await loadCountries()
  // id может быть 0 (легаси «Россия» с id=0) — проверяем на null/undefined
  if (form.value.delivery_country_id != null) {
    await loadCities(form.value.delivery_country_id)
  }
  isLoading.value = false
})
</script>
