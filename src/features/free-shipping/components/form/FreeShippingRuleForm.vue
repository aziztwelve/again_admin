<template>
  <div class="space-y-6">

    <!-- Название и порог -->
    <div class="grid gap-5 md:grid-cols-2">
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-700">Название*</label>
        <Input v-model="form.name" placeholder="Доставка_СДЕК_ПВЗ"/>
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-700">Сумма бесплатной доставки, ₽*</label>
        <Input v-model="minOrderAmount" type="number" min="0" step="1" placeholder="5000"/>
        <p class="text-xs text-gray-500">
          Сравнивается с суммой выкупа — после скидок, промокода и акций.
        </p>
      </div>
    </div>

    <!-- Службы и виды доставки -->
    <div class="grid gap-5 md:grid-cols-2">
      <CheckboxGroup
          title="Служба доставки"
          hint="Ничего не выбрано — правило действует для всех служб"
          :options="options.services"
          v-model="form.services"
      />
      <CheckboxGroup
          title="Вид доставки"
          hint="Ничего не выбрано — и ПВЗ, и курьер"
          :options="options.delivery_types"
          v-model="form.delivery_types"
      />
    </div>

    <!-- Способы оплаты -->
    <CheckboxGroup
        title="Способы оплаты"
        hint="Ничего не выбрано — любая оплата"
        :options="options.payment_methods"
        v-model="form.payment_methods"
    />

    <!-- Товары -->
    <div class="space-y-2">
      <div class="flex items-baseline justify-between">
        <span class="text-sm font-medium text-gray-700">Товары из каталога онлайн</span>
        <span class="text-xs text-gray-500">
          Если выбраны — порог считается только по этим товарам
        </span>
      </div>

      <Input v-model="productSearch" placeholder="Поиск товара по названию"/>

      <div v-if="selectedProducts.length" class="flex flex-wrap gap-1">
        <span
            v-for="product in selectedProducts"
            :key="`sel-product-${product.id}`"
            class="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
        >
          {{ product.name }}
          <button type="button" class="text-gray-400 hover:text-red-500" @click="toggleId(form.product_ids, product.id)">×</button>
        </span>
      </div>

      <div class="max-h-40 overflow-y-auto rounded border divide-y">
        <label
            v-for="product in productResults"
            :key="`product-${product.id}`"
            class="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-50"
        >
          <input
              type="checkbox"
              :checked="form.product_ids.includes(product.id)"
              @change="toggleId(form.product_ids, product.id)"
          />
          <span class="flex-1">{{ product.name }}</span>
          <span class="text-xs text-gray-400">{{ product.price }} ₽</span>
        </label>
        <div v-if="!productResults.length" class="px-2 py-2 text-sm text-gray-400">
          Ничего не найдено
        </div>
      </div>
    </div>

    <!-- География -->
    <div class="grid gap-5 md:grid-cols-2">
      <SearchableList
          title="Страны"
          hint="Пусто — все страны"
          placeholder="Поиск страны"
          :items="options.countries"
          v-model="form.country_ids"
      />
      <SearchableList
          title="Регионы"
          :hint="form.country_ids.length ? 'Показаны регионы выбранных стран' : 'Пусто — все регионы'"
          placeholder="Поиск региона"
          :items="regionItems"
          v-model="form.region_ids"
      />
    </div>

    <!-- Период и активность -->
    <div class="grid gap-4 md:grid-cols-3">
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-700">Действует с</label>
        <input v-model="startsAt" type="datetime-local" class="w-full rounded border px-2 py-1.5 text-sm"/>
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-700">Действует до</label>
        <input v-model="endsAt" type="datetime-local" class="w-full rounded border px-2 py-1.5 text-sm"/>
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-700">Приоритет</label>
        <Input v-model="priority" type="number" step="1"/>
        <p class="text-xs text-gray-500">Влияет только на порядок в списке</p>
      </div>
    </div>

    <label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
      <input type="checkbox" v-model="form.is_active"/>
      Правило активно
    </label>

    <div class="flex justify-end gap-2 pt-2">
      <Button variant="outline" type="button" @click="emit('cancel')">Отмена</Button>
      <Button type="button" :disabled="!canSubmit || saving" @click="emit('submit')">
        {{ submitText }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import CheckboxGroup from './CheckboxGroup.vue'
import SearchableList from './SearchableList.vue'
import { useFreeShippingRules } from '../../composables/useFreeShippingRules'
import type {
  FreeShippingOptions,
  FreeShippingProductOption,
  FreeShippingRuleForm,
} from '../../types'

const props = defineProps<{
  form: FreeShippingRuleForm
  options: FreeShippingOptions
  saving?: boolean
  submitText?: string
}>()

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const { searchProducts } = useFreeShippingRules()

const submitText = computed(() => props.submitText ?? 'Сохранить')

const canSubmit = computed(() =>
    props.form.name.trim().length > 0
    && props.form.min_order_amount !== null
    && Number(props.form.min_order_amount) >= 0,
)

// Прокси для number/date-полей: Input отдаёт строку.
const minOrderAmount = computed({
  get: () => props.form.min_order_amount === null ? '' : String(props.form.min_order_amount),
  set: (value: string) => {
    props.form.min_order_amount = value === '' ? null : Number(value)
  },
})

const priority = computed({
  get: () => String(props.form.priority ?? 0),
  set: (value: string) => {
    props.form.priority = value === '' ? 0 : Number(value)
  },
})

/** `2026-08-18 10:00:00` ⇄ `2026-08-18T10:00` для input[type=datetime-local]. */
const toLocalInput = (value: string | null) => value ? value.replace(' ', 'T').slice(0, 16) : ''
const fromLocalInput = (value: string) => value ? value.replace('T', ' ') + ':00' : null

const startsAt = computed({
  get: () => toLocalInput(props.form.starts_at),
  set: (value: string) => {
    props.form.starts_at = fromLocalInput(value)
  },
})

const endsAt = computed({
  get: () => toLocalInput(props.form.ends_at),
  set: (value: string) => {
    props.form.ends_at = fromLocalInput(value)
  },
})

// Регионы фильтруются выбранными странами: иначе в списке 1600+ записей.
const regionItems = computed(() => {
  if (!props.form.country_ids.length) return props.options.regions
  return props.options.regions.filter(r => props.form.country_ids.includes(r.country_id))
})

// Товары ищем на бэке (каталог большой), выбранные подтягиваем по ids.
const productSearch = ref('')
const productResults = ref<FreeShippingProductOption[]>([])
const knownProducts = ref<Record<number, FreeShippingProductOption>>({})

const selectedProducts = computed(() =>
    props.form.product_ids.map(id => knownProducts.value[id] ?? { id, name: `Товар #${id}` }),
)

let searchTimer: ReturnType<typeof setTimeout> | null = null

const loadProducts = async () => {
  const items = await searchProducts(productSearch.value, props.form.product_ids)
  productResults.value = items
  items.forEach(item => {
    knownProducts.value[item.id] = item
  })
}

watch(productSearch, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(loadProducts, 350)
})

onMounted(loadProducts)

const toggleId = (list: number[], id: number) => {
  const index = list.indexOf(id)
  if (index === -1) {
    list.push(id)
  } else {
    list.splice(index, 1)
  }
}
</script>

<style scoped></style>
