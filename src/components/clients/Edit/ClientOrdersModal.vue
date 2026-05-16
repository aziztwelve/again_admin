<template>
  <DynamicsModal
      :dialog-open="open"
      @close="emit('update:open', false)"
      title="Заказы клиента"
      description="Полный список заказов выбранного клиента"
      dynamic-style="md:min-w-[70%]"
  >
    <template #content>
      <div v-if="loading" class="py-10 flex items-center justify-center">
        <Spinner/>
      </div>

      <div v-else-if="!orders.length" class="py-10 text-center text-muted-foreground">
        У клиента пока нет заказов
      </div>

      <div v-else class="space-y-3">
        <div class="overflow-x-auto rounded border">
          <table class="w-full text-sm">
            <thead class="bg-muted/50 text-left">
            <tr>
              <th class="px-3 py-2 font-medium">№</th>
              <th class="px-3 py-2 font-medium">Дата</th>
              <th class="px-3 py-2 font-medium">Сумма</th>
              <th class="px-3 py-2 font-medium">Статус</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="o in orders" :key="o.id" class="border-t">
              <td class="px-3 py-2 whitespace-nowrap">
                <RouterLink
                    :to="`/order/${o.id}`"
                    target="_blank"
                    class="text-blue-600 hover:underline"
                >
                  {{ o.order_number || o.id }}
                </RouterLink>
              </td>
              <td class="px-3 py-2 whitespace-nowrap">
                {{ formatDateToRussian(o.created_at) }}
              </td>
              <td class="px-3 py-2 whitespace-nowrap">
                {{ formatPrice(o.total_amount) }}
              </td>
              <td class="px-3 py-2">
                <span
                    v-if="getStatus('order', String(o.status ?? '').trim())"
                    :style="{ backgroundColor: getStatus('order', String(o.status ?? '').trim())?.color }"
                    class="px-2 py-1 rounded text-white whitespace-nowrap"
                >
                  {{ getStatus('order', String(o.status ?? '').trim())?.label }}
                </span>
                <span v-else class="text-muted-foreground">—</span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-if="meta && meta.last_page > 1" class="flex items-center justify-between gap-3 pt-2">
          <div class="text-xs text-muted-foreground">
            Стр. {{ meta.current_page }} из {{ meta.last_page }} · Всего: {{ meta.total }}
          </div>
          <div class="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                :disabled="meta.current_page <= 1 || loading"
                @click="changePage(meta.current_page - 1)"
            >
              Назад
            </Button>
            <Button
                variant="outline"
                size="sm"
                :disabled="meta.current_page >= meta.last_page || loading"
                @click="changePage(meta.current_page + 1)"
            >
              Вперёд
            </Button>
          </div>
        </div>
      </div>
    </template>
  </DynamicsModal>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import axios from 'axios'
import {RouterLink} from 'vue-router'
import {toast} from 'vue-sonner'
import DynamicsModal from '@/components/dynamics/Modal.vue'
import {Spinner} from '@/components/ui/spinner'
import {Button} from '@/components/ui/button'
import {useDateFormat} from '@/composables/useDateFormat'
import {usePriceFormatter} from '@/composables/usePriceFormatter'
import {useStatusFunctions} from '@/composables/useStatusFunctions'

interface Props {
  open: boolean
  clientId: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const {formatDateToRussian} = useDateFormat()
const {formatPrice} = usePriceFormatter()
const {getStatus, getAllStatuses, cachedStatuses} = useStatusFunctions()

const orders = ref<any[]>([])
const meta = ref<any | null>(null)
const loading = ref(false)
const page = ref(1)
const perPage = 20

async function fetchOrders() {
  if (!props.clientId) return
  loading.value = true
  try {
    if (!cachedStatuses.value) {
      await getAllStatuses()
    }
    const {data} = await axios.get('/orders', {
      params: {
        client_id: props.clientId,
        per_page: perPage,
        page: page.value,
      },
    })
    orders.value = data?.data ?? []
    meta.value = data?.meta ?? null
  } catch (e) {
    console.error(e)
    toast.error('Не удалось загрузить заказы клиента')
    orders.value = []
    meta.value = null
  } finally {
    loading.value = false
  }
}

function changePage(p: number) {
  page.value = p
  fetchOrders()
}

watch(
    () => props.open,
    (val) => {
      if (val) {
        page.value = 1
        fetchOrders()
      }
    },
)
</script>
