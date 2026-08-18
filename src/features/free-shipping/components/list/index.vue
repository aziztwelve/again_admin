<template>
  <div class="space-y-3">

    <div class="flex flex-wrap items-center justify-between gap-2">
      <BackButton title="Бесплатная доставка"/>
      <Button variant="outline" @click="openCreate">Добавить правило</Button>
    </div>

    <p class="text-sm text-gray-500">
      Правило делает доставку бесплатной, когда выполнены все заполненные условия
      и сумма выкупа (после скидок, промокода и акций) не меньше порога.
      Пустое условие ограничений не накладывает.
    </p>

    <div class="flex flex-wrap gap-2">
      <Input v-model="search" class="max-w-xs" placeholder="Поиск по названию"/>
      <select v-model="activeFilter" class="rounded border px-2 text-sm">
        <option value="">Все</option>
        <option value="1">Только активные</option>
        <option value="0">Только выключенные</option>
      </select>
      <Button variant="outline" @click="loadRules">Обновить</Button>
    </div>

    <div class="overflow-x-auto rounded border">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-left text-gray-500">
          <tr>
            <th class="px-3 py-2 font-medium">Название</th>
            <th class="px-3 py-2 font-medium">От суммы</th>
            <th class="px-3 py-2 font-medium">Службы</th>
            <th class="px-3 py-2 font-medium">Вид</th>
            <th class="px-3 py-2 font-medium">Оплата</th>
            <th class="px-3 py-2 font-medium">Товары</th>
            <th class="px-3 py-2 font-medium">География</th>
            <th class="px-3 py-2 font-medium">Статус</th>
            <th class="px-3 py-2 font-medium text-right">Действия</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="rule in rules" :key="rule.id" class="hover:bg-gray-50">
            <td class="px-3 py-2 font-medium text-gray-800">{{ rule.name }}</td>
            <td class="px-3 py-2 whitespace-nowrap">{{ formatAmount(rule.min_order_amount) }} ₽</td>
            <td class="px-3 py-2">{{ listOrAny(rule.services_labels) }}</td>
            <td class="px-3 py-2">{{ listOrAny(rule.delivery_types_labels) }}</td>
            <td class="px-3 py-2">{{ listOrAny(rule.payment_methods_labels) }}</td>
            <td class="px-3 py-2">
              {{ rule.products.length ? `${rule.products.length} шт.` : 'все' }}
            </td>
            <td class="px-3 py-2">
              {{ geoSummary(rule) }}
            </td>
            <td class="px-3 py-2">
              <span
                  class="rounded px-2 py-0.5 text-xs"
                  :class="rule.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
              >
                {{ rule.is_active ? 'Активно' : 'Выключено' }}
              </span>
            </td>
            <td class="px-3 py-2">
              <div class="flex items-center justify-end gap-2">
                <button
                    type="button"
                    class="text-gray-400 hover:text-gray-700"
                    :title="rule.is_active ? 'Выключить' : 'Включить'"
                    @click="handleToggle(rule)"
                >
                  <Power :size="16"/>
                </button>
                <button type="button" class="text-gray-400 hover:text-gray-700" title="Изменить" @click="openEdit(rule)">
                  <Pencil :size="16"/>
                </button>
                <button type="button" class="text-gray-400 hover:text-red-600" title="Удалить" @click="handleDelete(rule)">
                  <Trash2 :size="16"/>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!rules.length && !sending">
            <td colspan="9" class="px-3 py-6 text-center text-gray-400">
              Правил пока нет. Пока их нет, доставка всегда платная.
            </td>
          </tr>
          <tr v-if="sending">
            <td colspan="9" class="px-3 py-6 text-center text-gray-400">Загрузка…</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Dialog v-model:open="modalOpen">
      <DialogContent class="max-h-full overflow-y-auto md:min-w-[60%]">
        <DialogHeader>
          <DialogTitle class="text-md text-gray-800">
            {{ form.id ? 'Изменить правило' : 'Новое правило бесплатной доставки' }}
          </DialogTitle>
        </DialogHeader>

        <FreeShippingRuleForm
            :form="form"
            :options="options"
            :saving="sending"
            :submit-text="form.id ? 'Сохранить' : 'Создать'"
            @submit="handleSubmit"
            @cancel="modalOpen = false"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Pencil, Power, Trash2 } from 'lucide-vue-next'
import BackButton from '@/components/BackButton.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import FreeShippingRuleForm from '../form/FreeShippingRuleForm.vue'
import { useFreeShippingRules } from '../../composables/useFreeShippingRules'
import {
  createEmptyRuleForm,
  ruleToForm,
  type FreeShippingOptions,
  type FreeShippingRule,
  type FreeShippingRuleForm as RuleForm,
} from '../../types'

const { sending, getRules, getOptions, createRule, updateRule, deleteRule, toggleRule } = useFreeShippingRules()

const rules = ref<FreeShippingRule[]>([])
const search = ref('')
const activeFilter = ref('')
const modalOpen = ref(false)
const form = ref<RuleForm>(createEmptyRuleForm())

const options = ref<FreeShippingOptions>({
  services: [],
  delivery_types: [],
  payment_methods: [],
  countries: [],
  regions: [],
})

let searchTimer: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  const loaded = await getOptions()
  if (loaded) {
    options.value = {
      services: loaded.services ?? [],
      delivery_types: loaded.delivery_types ?? [],
      payment_methods: loaded.payment_methods ?? [],
      countries: loaded.countries ?? [],
      regions: loaded.regions ?? [],
    }
  }
  await loadRules()
})

watch([search, activeFilter], () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(loadRules, 350)
})

async function loadRules() {
  const response = await getRules({
    search: search.value || undefined,
    is_active: activeFilter.value === '' ? undefined : activeFilter.value,
    per_page: 100,
  })

  rules.value = response?.data ?? []
}

const openCreate = () => {
  form.value = createEmptyRuleForm()
  modalOpen.value = true
}

const openEdit = (rule: FreeShippingRule) => {
  form.value = ruleToForm(rule)
  modalOpen.value = true
}

const handleSubmit = async () => {
  try {
    if (form.value.id) {
      await updateRule(form.value.id, form.value)
    } else {
      await createRule(form.value)
    }
    modalOpen.value = false
    await loadRules()
  } catch (e) {
    // Сообщение уже показал useErrorHandler в composable.
  }
}

const handleToggle = async (rule: FreeShippingRule) => {
  try {
    const isActive = await toggleRule(rule.id)
    if (typeof isActive === 'boolean') rule.is_active = isActive
  } catch (e) {
    /* обработано в composable */
  }
}

const handleDelete = async (rule: FreeShippingRule) => {
  if (!window.confirm(`Удалить правило «${rule.name}»?`)) return

  try {
    await deleteRule(rule.id)
    rules.value = rules.value.filter(item => item.id !== rule.id)
  } catch (e) {
    /* обработано в composable */
  }
}

const formatAmount = (value: number) => new Intl.NumberFormat('ru-RU').format(Number(value ?? 0))

const listOrAny = (labels: string[]) => labels?.length ? labels.join(', ') : 'любые'

const geoSummary = (rule: FreeShippingRule) => {
  const parts: string[] = []
  if (rule.countries?.length) parts.push(`страны: ${rule.countries.length}`)
  if (rule.regions?.length) parts.push(`регионы: ${rule.regions.length}`)

  return parts.length ? parts.join(', ') : 'везде'
}
</script>

<style scoped></style>
