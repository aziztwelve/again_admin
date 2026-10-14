<template>
  <Dialog :open="cartId !== null" @update:open="!$event && $emit('close')">
    <DialogContent class="flex max-h-[92dvh] w-[calc(100%_-_2rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0">
      <DialogHeader class="shrink-0 border-b px-6 py-5 pr-12">
        <DialogTitle>Корзина #{{ cartId }}</DialogTitle>
        <DialogDescription>Состав корзины, клиент и история общения</DialogDescription>
      </DialogHeader>

      <div v-if="loading" class="p-12 text-center text-sm text-gray-500" role="status">Загружаем корзину…</div>
      <div v-else-if="!cart" class="space-y-3 p-10 text-center">
        <p class="text-sm text-gray-500">Не удалось загрузить корзину.</p>
        <Button variant="outline" @click="load">Попробовать снова</Button>
      </div>
      <div v-else class="min-h-0 overflow-y-auto">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b bg-gray-50 px-6 py-4">
          <div>
            <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="cart.status === 'ordered' ? 'bg-green-100 text-green-800' : cart.status === 'abandoned' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700'">{{ statusLabel(cart.status) }}</span>
            <p class="mt-2 text-xs text-gray-500">Создана {{ formatDate(cart.created_at) }}</p>
          </div>
          <Button v-if="cart.can_create_order" as-child>
            <RouterLink :to="{name: 'orders-create', query: {cart_id: cart.id, client_id: cart.customer.id}}">Оформить заказ</RouterLink>
          </Button>
        </div>

        <div class="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_240px]">
          <div class="min-w-0 space-y-6">
            <section>
              <h3 class="text-sm font-semibold text-gray-900">Состав корзины · {{ cart.items.length }} поз.</h3>
              <p class="mt-1 text-xs text-gray-500">Сохранённые цены. При оформлении проверяются текущие цены и остатки.</p>
              <p v-if="!cart.items.length" class="py-8 text-sm text-gray-500">Корзина пуста.</p>
              <ul class="mt-3 divide-y rounded-lg border">
                <li v-for="item in cart.items" :key="item.id" class="flex gap-3 p-3">
                  <img v-if="item.image_url" :src="item.image_url" :alt="item.name" class="h-14 w-14 shrink-0 rounded-md bg-gray-50 object-cover" />
                  <div v-else class="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-gray-100"><Package class="h-5 w-5 text-gray-400" /></div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                    <p class="mt-0.5 text-xs text-gray-500">{{ [item.variant_name, item.color].filter(Boolean).join(' · ') }}</p>
                    <p v-if="item.sku" class="text-xs text-gray-500">Артикул: {{ item.sku }}</p>
                    <p class="mt-1 text-xs text-gray-600">{{ item.quantity }} шт. × {{ money(item.price) }}</p>
                    <p v-if="!item.available" class="mt-1 text-xs text-red-700">Товар больше недоступен</p>
                    <p v-else-if="item.stock_quantity < item.quantity" class="mt-1 text-xs text-amber-700">Недостаточно на складе: {{ item.stock_quantity }} шт.</p>
                  </div>
                  <div class="shrink-0 text-right">
                    <p class="text-sm font-semibold">{{ money(item.total) }}</p>
                    <p v-if="item.price_original > item.price" class="mt-1 text-xs text-gray-400 line-through">{{ money(item.price_original * item.quantity) }}</p>
                  </div>
                </li>
              </ul>
              <dl class="ml-auto mt-4 max-w-xs space-y-2 text-sm">
                <div v-if="cart.total_discount > 0" class="flex justify-between gap-4 text-gray-500"><dt>Скидка</dt><dd>−{{ money(cart.total_discount) }}</dd></div>
                <div class="flex justify-between gap-4 font-semibold text-gray-900"><dt>Сумма товаров</dt><dd>{{ money(cart.total) }}</dd></div>
              </dl>
            </section>

            <section class="border-t pt-5">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h3 class="text-sm font-semibold">История коммуникаций</h3>
                <Button v-if="cart.can_create_order" variant="outline" size="sm" :disabled="!cart.available_channels.length || sending" @click="composer = composer ? null : 'message'">Написать</Button>
              </div>
              <p v-if="!cart.available_channels.length" class="mt-2 text-xs text-gray-500">У клиента нет доступного канала для отправки.</p>
              <div v-if="composer" class="mt-3 space-y-3 rounded-lg border bg-gray-50 p-4">
                <div class="flex gap-3">
                  <button type="button" class="text-sm underline-offset-4" :class="composer === 'message' ? 'font-semibold underline' : 'text-gray-500'" @click="composer = 'message'">Личное сообщение</button>
                  <button type="button" class="text-sm underline-offset-4" :class="composer === 'reminder' ? 'font-semibold underline' : 'text-gray-500'" @click="composer = 'reminder'">Напоминание</button>
                </div>
                <label class="block text-xs font-medium">Канал
                  <select v-model="channel" class="mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm"><option v-for="value in cart.available_channels" :key="value" :value="value">{{ channelLabel(value) }}</option></select>
                </label>
                <template v-if="composer === 'message'">
                  <label v-if="channel === 'email'" class="block text-xs font-medium">Тема письма<input v-model="subject" maxlength="255" class="mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm" /></label>
                  <label class="block text-xs font-medium">Сообщение<textarea v-model="message" rows="4" maxlength="5000" placeholder="Напишите клиенту…" class="mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm" /></label>
                </template>
                <p v-else class="text-sm text-gray-600">Клиент получит стандартное напоминание с составом корзины и ссылкой для возвращения к оформлению.</p>
                <div class="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" :disabled="sending" @click="composer = null">Отмена</Button>
                  <Button size="sm" :disabled="sending || !channel || (composer === 'message' && !message.trim())" @click="send">{{ sending ? 'Отправляем…' : 'Отправить' }}</Button>
                </div>
              </div>
              <p v-if="!cart.communications.length" class="mt-3 text-sm text-gray-500">Сообщений по этой корзине ещё нет.</p>
              <ol v-else class="mt-3 divide-y">
                <li v-for="communication in cart.communications" :key="communication.id" class="flex items-start justify-between gap-3 py-3 text-sm">
                  <div class="min-w-0 flex-1">
                    <p class="font-medium">{{ channelLabel(communication.channel) }} <span class="font-normal text-gray-500">· {{ communication.type === 'manual' ? 'Вручную' : `Автоматически${communication.step ? ', шаг ' + communication.step : ''}` }}</span></p>
                    <p class="mt-1 text-xs text-gray-500">{{ formatDate(communication.sent_at || communication.created_at) }}</p>
                    <details v-if="communication.body" class="mt-2 text-xs">
                      <summary class="cursor-pointer text-blue-700">{{ communication.subject || 'Текст сообщения' }}</summary>
                      <p class="mt-2 whitespace-pre-wrap break-words rounded-md bg-gray-50 p-3 text-gray-700">{{ communication.body }}</p>
                    </details>
                  </div>
                  <span class="text-xs" :class="communication.status === 'failed' ? 'text-red-700' : communication.status === 'sent' ? 'text-green-700' : 'text-gray-500'">{{ communicationLabel(communication.status) }}</span>
                </li>
              </ol>
            </section>

            <section class="border-t pt-5">
              <div class="flex items-center justify-between gap-3">
                <h3 class="text-sm font-semibold">Заказы клиента · {{ cart.orders_count }}</h3>
                <RouterLink v-if="cart.customer.id" :to="{name: 'clients-show', params: {id: cart.customer.id}}" class="text-xs text-blue-700 hover:underline">Все заказы</RouterLink>
              </div>
              <p class="mt-1 text-xs text-gray-500">Другие заказы клиента не означают, что эта корзина оформлена.</p>
              <p v-if="!cart.orders.length" class="mt-3 text-sm text-gray-500">У клиента пока нет заказов.</p>
              <ul v-else class="mt-3 divide-y">
                <li v-for="order in cart.orders" :key="order.id" class="flex justify-between gap-3 py-3 text-sm">
                  <div><RouterLink :to="{name: 'orders-view', params: {id: order.id}}" class="font-medium text-blue-700 hover:underline">Заказ #{{ order.number || order.id }}</RouterLink><p class="mt-1 text-xs text-gray-500">{{ formatDate(order.created_at) }} · {{ order.status_label }}</p><p v-if="order.from_this_cart" class="mt-1 text-xs font-medium text-green-700">Оформлен из этой корзины</p></div>
                  <span class="shrink-0 font-medium">{{ money(order.total) }}</span>
                </li>
              </ul>
              <p v-if="cart.orders_count > cart.orders.length" class="mt-2 text-xs text-gray-500">Показаны последние {{ cart.orders.length }} заказов. Полная история — в карточке клиента.</p>
            </section>
          </div>

          <aside class="space-y-5 md:border-l md:pl-5">
            <section>
              <h3 class="text-sm font-semibold">Клиент</h3>
              <RouterLink v-if="cart.customer.id" :to="{name: 'clients-show', params: {id: cart.customer.id}}" class="mt-2 block text-sm font-medium text-blue-700 hover:underline">{{ cart.customer.name || 'Без имени' }}</RouterLink>
              <p v-else class="mt-2 text-sm text-gray-500">Клиент удалён</p>
              <p v-if="cart.customer.id" class="mt-1 text-xs text-gray-500">ID: {{ cart.customer.id }}</p>
              <a v-if="cart.customer.phone" :href="`tel:${cart.customer.phone}`" class="mt-3 block break-all text-sm text-gray-700">{{ cart.customer.phone }}</a>
              <a v-if="cart.customer.email" :href="`mailto:${cart.customer.email}`" class="mt-2 block break-all text-sm text-gray-700">{{ cart.customer.email }}</a>
            </section>
            <dl class="space-y-4 border-t pt-4 text-xs">
              <div><dt class="text-gray-500">Последнее обновление</dt><dd class="mt-1">{{ formatDate(cart.updated_at) }}</dd></div>
              <div><dt class="text-gray-500">Активность клиента</dt><dd class="mt-1">{{ formatDate(cart.last_activity_at) }}</dd></div>
              <div v-if="cart.abandoned_at"><dt class="text-gray-500">Начало цепочки напоминаний</dt><dd class="mt-1">{{ formatDate(cart.abandoned_at) }}</dd></div>
              <div v-if="cart.ordered_at"><dt class="text-gray-500">Заказ оформлен</dt><dd class="mt-1">{{ formatDate(cart.ordered_at) }}</dd></div>
            </dl>
          </aside>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {onBeforeUnmount, ref, watch} from 'vue'
import {Package} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {useAbandonedCartFunctions} from '@/composables/useAbandonedCartFunctions'
import type {AbandonedCartDetails, CartStatus} from '@/types/abandoned-cart'

const props = defineProps<{cartId: number | null}>()
const emit = defineEmits<{(e: 'close'): void; (e: 'updated'): void}>()
const {getCartDetails, sendReminder} = useAbandonedCartFunctions()
const cart = ref<AbandonedCartDetails>()
const loading = ref(false)
const sending = ref(false)
const composer = ref<'message' | 'reminder' | null>(null)
const message = ref('')
const subject = ref('Сообщение о вашей корзине')
const channel = ref('')
let requestVersion = 0

const load = async () => {
  const id = props.cartId
  const version = ++requestVersion
  if (id === null) return
  loading.value = true
  const result = await getCartDetails(id)
  if (version !== requestVersion) return
  cart.value = result
  if (!result?.available_channels.includes(channel.value)) channel.value = result?.available_channels[0] || ''
  loading.value = false
}

const send = async () => {
  if (!cart.value || sending.value || !channel.value) return
  const id = cart.value.id
  sending.value = true
  try {
    const ok = await sendReminder(id, channel.value, composer.value === 'message' ? message.value.trim() : undefined, channel.value === 'email' ? subject.value.trim() || undefined : undefined)
    if (ok) {
      emit('updated')
      if (props.cartId === id) {
        composer.value = null
        message.value = ''
        await load()
      }
    }
  } finally { sending.value = false }
}

watch(() => props.cartId, () => {
  cart.value = undefined
  composer.value = null
  message.value = ''
  subject.value = 'Сообщение о вашей корзине'
  channel.value = ''
  load()
}, {immediate: true})
onBeforeUnmount(() => { requestVersion++ })

const money = (value: number) => new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB', maximumFractionDigits: 2}).format(value)
const formatDate = (value: string | null) => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleString('ru-RU', {dateStyle: 'short', timeStyle: 'short'}) : '—'
const statusLabel = (status: CartStatus) => status === 'ordered' ? 'Заказ оформлен' : status === 'abandoned' ? 'Брошенная' : 'Активная'
const channelLabels: Record<string, string> = {email: 'Email', telegram: 'Telegram', max: 'MAX', vk: 'ВКонтакте', whatsapp: 'WhatsApp'}
const communicationLabels: Record<string, string> = {queued: 'В очереди', sent: 'Отправлено', failed: 'Ошибка отправки'}
const channelLabel = (value: string) => channelLabels[value] || value
const communicationLabel = (value: string) => communicationLabels[value] || value
</script>
