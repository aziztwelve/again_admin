<template>
  <div class="space-y-4">
    <!-- Заголовок + действия -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <DynamicTitle title="Источники заказов"/>
      <div class="flex gap-2">
        <Button @click="linkModal?.openCreate()">
          <Plus class="h-4 w-4 mr-1"/>
          Создать метку
        </Button>
        <Button variant="outline" @click="channelsModal?.open()">Каналы</Button>
        <Button variant="outline" @click="tagsModal?.open()">Теги</Button>
      </div>
    </div>

    <!-- Фильтры -->
    <UtmFilters
        v-model="filters"
        :channels="channels"
        :tags="tags"
        :links="links"
        @apply="loadAnalytics"
    />

    <!-- График -->
    <div>
      <UtmBarChart
          :chart="analytics?.chart ?? {labels: [], series: []}"
          :rows-by-link="rowsByLink"
      />
    </div>

    <!-- Сводная таблица -->
    <div>
      <h3 class="text-base font-semibold text-gray-800 mb-2">
        Сводная таблица<span v-if="periodLabel" class="text-sm font-normal text-gray-500"> {{ periodLabel }}</span>
      </h3>
      <UtmSummaryTable
          :rows="analytics?.rows ?? []"
          :totals="analytics?.totals ?? emptyTotals"
      />
    </div>

    <!-- Управление метками -->
    <div>
      <h3 class="text-base font-semibold text-gray-800 mb-2">UTM-метки</h3>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Канал</TableHead>
              <TableHead>Тег</TableHead>
              <TableHead>Ссылка</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead class="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="!links.length">
              <TableCell colspan="6" class="text-center text-sm text-gray-400 py-6">
                Меток пока нет. Нажмите «Создать метку».
              </TableCell>
            </TableRow>
            <TableRow v-for="link in links" :key="link.id">
              <TableCell class="font-medium">{{ link.name }}</TableCell>
              <TableCell>{{ link.channel?.name ?? '—' }}</TableCell>
              <TableCell>{{ link.tag?.name ?? '—' }}</TableCell>
              <TableCell>
                <div class="flex items-center gap-1.5 max-w-[260px]">
                  <span class="truncate text-xs text-gray-500" :title="link.tracking_url">{{ link.tracking_url }}</span>
                  <button
                      type="button"
                      class="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                      title="Копировать ссылку"
                      @click="copy(link.tracking_url)"
                  >
                    <Copy class="h-3.5 w-3.5"/>
                  </button>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Switch
                      :model-value="link.is_active"
                      :disabled="togglingId === link.id"
                      :title="link.is_active ? 'Метка активна — нажмите, чтобы выключить' : 'Метка выключена — нажмите, чтобы включить'"
                      @update:model-value="(v: boolean) => toggleActive(link, v)"
                  />
                  <span class="text-xs" :class="link.is_active ? 'text-green-600' : 'text-gray-400'">
                    {{ link.is_active ? 'Активна' : 'Выключена' }}
                  </span>
                </div>
              </TableCell>
              <TableCell class="text-right">
                <div class="inline-flex gap-1">
                  <button
                      type="button"
                      class="inline-flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      title="Редактировать"
                      @click="linkModal?.openEdit(link)"
                  >
                    <Pencil class="h-4 w-4"/>
                  </button>
                  <button
                      type="button"
                      class="inline-flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="Удалить"
                      @click="removeLink(link)"
                  >
                    <Trash2 class="h-4 w-4"/>
                  </button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- Модалки -->
    <UtmLinkFormModal ref="linkModal" :channels="channels" :tags="tags" @saved="onDictionariesChanged"/>
    <UtmChannelsModal ref="channelsModal" :channels="channels" @changed="onDictionariesChanged"/>
    <UtmTagsModal ref="tagsModal" :tags="tags" @changed="onDictionariesChanged"/>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {Button} from '@/components/ui/button'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table'
import {Switch} from '@/components/ui/switch'
import {Copy, Pencil, Plus, Trash2} from 'lucide-vue-next'
import {toast} from 'vue-sonner'
import DynamicTitle from '@/components/dynamics/DynamicTitle.vue'
import UtmFilters from '@/components/analytics/utm/UtmFilters.vue'
import UtmBarChart from '@/components/analytics/utm/UtmBarChart.vue'
import UtmSummaryTable from '@/components/analytics/utm/UtmSummaryTable.vue'
import UtmLinkFormModal from '@/components/analytics/utm/UtmLinkFormModal.vue'
import UtmChannelsModal from '@/components/analytics/utm/UtmChannelsModal.vue'
import UtmTagsModal from '@/components/analytics/utm/UtmTagsModal.vue'
import {useUtmFunctions} from '@/composables/useUtmFunctions'
import type {
  MarketingChannel,
  UtmAnalyticsFilters,
  UtmAnalyticsResponse,
  UtmAnalyticsRow,
  UtmAnalyticsTotals,
  UtmLink,
  UtmTag,
} from '@/types/utm'

const {getChannels, getTags, getLinks, getAnalytics, deleteLink, setLinkActive} = useUtmFunctions()

const channels = ref<MarketingChannel[]>([])
const tags = ref<UtmTag[]>([])
const links = ref<UtmLink[]>([])
const analytics = ref<UtmAnalyticsResponse | undefined>(undefined)

const filters = ref<UtmAnalyticsFilters>({
  channel_id: null,
  tag_id: null,
  link_ids: [],
  user_type: 'all',
  from: undefined,
  to: undefined,
})

const togglingId = ref<number | null>(null)

const linkModal = ref<InstanceType<typeof UtmLinkFormModal> | null>(null)
const channelsModal = ref<InstanceType<typeof UtmChannelsModal> | null>(null)
const tagsModal = ref<InstanceType<typeof UtmTagsModal> | null>(null)

const emptyTotals: UtmAnalyticsTotals = {
  visits: 0, orders: 0, orders_amount: 0, purchases: 0,
  purchases_amount: 0, clients: 0, cr_order: 0, cr_purchase: 0,
}

const periodLabel = computed(() => {
  if (!analytics.value?.from || !analytics.value?.to) return ''
  const fmt = (s: string) => s.split('-').reverse().join('.')
  return `за период ${fmt(analytics.value.from)} — ${fmt(analytics.value.to)}`
})

// Строки аналитики по метке (link_id → row) для подробного тултипа графика.
const rowsByLink = computed<Record<number, UtmAnalyticsRow>>(() => {
  const map: Record<number, UtmAnalyticsRow> = {}
  for (const row of analytics.value?.rows ?? []) {
    map[row.link_id] = row
  }
  return map
})

const loadDictionaries = async () => {
  // allSettled: падение одного справочника не должно обнулять остальные
  // (раньше Promise.all реджектился целиком — напр. ошибка в метках гасила каналы).
  const [ch, tg, lk] = await Promise.allSettled([getChannels(), getTags(), getLinks()])
  if (ch.status === 'fulfilled') channels.value = ch.value ?? []
  if (tg.status === 'fulfilled') tags.value = tg.value ?? []
  if (lk.status === 'fulfilled') links.value = lk.value ?? []
}

const loadAnalytics = async () => {
  analytics.value = await getAnalytics(filters.value)
}

const onDictionariesChanged = async () => {
  await loadDictionaries()
  await loadAnalytics()
}

const toggleActive = async (link: UtmLink, value: boolean) => {
  if (togglingId.value === link.id || link.is_active === value) return
  const prev = link.is_active
  link.is_active = value // оптимистично
  togglingId.value = link.id
  try {
    await setLinkActive(link.id, value)
  } catch (e) {
    link.is_active = prev // откат при ошибке
  } finally {
    togglingId.value = null
  }
}

const removeLink = async (link: UtmLink) => {
  if (!confirm(`Удалить метку «${link.name}»?`)) return
  try {
    await deleteLink(link.id)
    await onDictionariesChanged()
  } catch (e) { /* обработано */ }
}

const copy = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    toast.success('Ссылка скопирована в буфер')
  } catch (e) {
    toast.error('Не удалось скопировать ссылку')
  }
}

onMounted(async () => {
  await loadDictionaries()
  await loadAnalytics()
})
</script>
