<template>
  <Dialog :open="cartId !== null" @update:open="!$event && $emit('close')">
    <DialogContent class="left-auto right-0 top-0 flex h-dvh max-h-dvh w-full max-w-[860px] translate-x-0 translate-y-0 flex-col gap-0 rounded-none p-0 sm:rounded-none">
      <DialogHeader class="shrink-0 border-b px-6 py-5 pr-12">
        <DialogTitle class="flex items-center gap-3"><button v-if="composer" type="button" aria-label="Назад к корзине" @click="composer = false"><ArrowLeft class="h-5 w-5" /></button>{{ composer ? 'Сообщение пользователю' : `Детали корзины #${cartId}` }}</DialogTitle>
        <DialogDescription>Состав корзины, клиент и история общения</DialogDescription>
      </DialogHeader>

      <div v-if="loading" class="p-12 text-center text-sm text-gray-500" role="status">Загружаем корзину…</div>
      <div v-else-if="!cart" class="space-y-3 p-10 text-center">
        <p class="text-sm text-gray-500">Не удалось загрузить корзину.</p>
        <Button variant="outline" @click="load">Попробовать снова</Button>
      </div>
      <div v-else-if="composer" class="min-h-0 flex-1 overflow-y-auto bg-gray-50"><CartMessageComposer :key="cart.id" :cart="cart" @sent="onSent" /></div>
      <div v-else class="min-h-0 flex-1 overflow-y-auto bg-gray-50">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b bg-gray-50 px-6 py-4">
          <div>
            <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="cart.status === 'ordered' ? 'bg-green-100 text-green-800' : cart.status === 'abandoned' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'">{{ statusLabel(cart.status) }}</span>
            <p class="mt-2 text-xs text-gray-500">Создана {{ formatDate(cart.created_at) }}</p>
            <RouterLink v-if="cart.linked_order" :to="{name: 'orders-view', params: {id: cart.linked_order.id}}" class="mt-2 block text-sm text-blue-700 hover:underline">↳ Заказ №{{ cart.linked_order.number || cart.linked_order.id }}</RouterLink>
          </div>
          <Button v-if="cart.can_create_order" as-child>
            <RouterLink :to="{name: 'orders-create', query: {cart_id: cart.id, client_id: cart.customer.id}}">Оформить заказ</RouterLink>
          </Button>
        </div>

        <div class="grid gap-5 p-5 sm:p-6">
          <div class="min-w-0 space-y-6">
            <section class="rounded-lg border bg-white p-5">
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

            <section class="rounded-lg border bg-white p-5">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h3 class="text-sm font-semibold">История коммуникаций</h3>
              </div>
              <p v-if="!cart.available_channels.length" class="mt-2 text-xs text-gray-500">У клиента нет доступного канала для отправки.</p>
              <p v-if="!cart.communications.length" class="mt-3 text-sm text-gray-500">Сообщений по этой корзине ещё нет.</p>
              <ol v-else class="mt-3 divide-y">
                <li v-for="communication in cart.communications" :key="communication.id" class="flex items-start justify-between gap-3 py-3 text-sm">
                  <div class="min-w-0 flex-1">
                    <p class="font-medium">{{ channelLabel(communication.channel) }} <span class="font-normal text-gray-500">· {{ communication.type === 'manual' ? 'Вручную' : `Автоматически${communication.step ? ', шаг ' + communication.step : ''}` }}</span></p>
                    <p class="mt-1 text-xs text-gray-500">{{ formatDate(communication.sent_at || communication.created_at) }}</p>
                    <button v-if="communication.body || communication.html" type="button" class="mt-2 text-left text-xs text-blue-700 hover:underline" @click="previewed = {subject: communication.subject || '', body: communication.body || '', html: communication.html}">{{ communication.subject || 'Посмотреть сообщение' }}</button>
                    <p v-else class="mt-2 text-xs text-gray-400">Текст старого сообщения не сохранён</p>
                  </div>
                  <span class="text-xs" :class="communication.status === 'failed' ? 'text-red-700' : communication.status === 'sent' ? 'text-green-700' : 'text-gray-500'">{{ communicationLabel(communication.status) }}</span>
                </li>
              </ol>
            </section>

            <section class="rounded-lg border bg-white p-5">
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

          <aside class="space-y-5 rounded-lg border bg-white p-5">
            <section>
              <h3 class="text-sm font-semibold">Информация о клиенте</h3>
              <RouterLink v-if="cart.customer.id" :to="{name: 'clients-show', params: {id: cart.customer.id}}" class="mt-2 block text-sm font-medium text-blue-700 hover:underline">{{ cart.customer.name || 'Без имени' }}</RouterLink>
              <p v-else class="mt-2 text-sm text-gray-500">Клиент удалён</p>
              <p v-if="cart.customer.id" class="mt-1 text-xs text-gray-500">ID: {{ cart.customer.id }}</p>
              <a v-if="cart.customer.phone" :href="`tel:${cart.customer.phone}`" class="mt-3 block break-all text-sm text-gray-700">{{ cart.customer.phone }}</a>
              <a v-if="cart.customer.email" :href="`mailto:${cart.customer.email}`" class="mt-2 block break-all text-sm text-gray-700">{{ cart.customer.email }}</a>
            </section>
            <div class="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div><span class="text-xs text-gray-500">Страна</span><p>{{ cart.customer.country || '—' }}</p></div>
              <div><span class="text-xs text-gray-500">Регион</span><p>{{ cart.customer.region || '—' }}</p></div>
              <div><span class="text-xs text-gray-500">Город</span><p>{{ cart.customer.city || '—' }}</p></div>
              <div class="flex flex-wrap items-center gap-3"><button v-if="cart.customer.phone" type="button" class="text-xs text-blue-700" @click="copy(cart.customer.phone)">Копировать телефон</button><button v-if="cart.customer.email" type="button" class="text-xs text-blue-700" @click="copy(cart.customer.email)">Копировать email</button><span role="status" class="text-xs text-gray-500">{{ copyStatus }}</span></div>
            </div>
            <dl class="grid gap-4 border-t pt-4 text-xs sm:grid-cols-2">
              <div><dt class="text-gray-500">Последнее обновление</dt><dd class="mt-1">{{ formatDate(cart.updated_at) }}</dd></div>
              <div><dt class="text-gray-500">Активность клиента</dt><dd class="mt-1">{{ formatDate(cart.last_activity_at) }}</dd></div>
              <div v-if="cart.abandoned_at"><dt class="text-gray-500">Начало цепочки напоминаний</dt><dd class="mt-1">{{ formatDate(cart.abandoned_at) }}</dd></div>
              <div v-if="cart.ordered_at"><dt class="text-gray-500">Заказ оформлен</dt><dd class="mt-1">{{ formatDate(cart.ordered_at) }}</dd></div>
            </dl>
          </aside>
        </div>
      </div>
      <footer v-if="!composer" class="flex shrink-0 justify-end gap-2 border-t bg-white px-6 py-4"><Button variant="outline" @click="$emit('close')">Закрыть</Button><Button :disabled="loading || !cart?.available_channels.length" @click="composer = true">Написать</Button></footer>
      <CartMessagePreview :message="previewed" @close="previewed = null" />
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {onBeforeUnmount, ref, watch} from 'vue'
import {ArrowLeft, Package} from 'lucide-vue-next'
import CartMessageComposer from './CartMessageComposer.vue'
import CartMessagePreview from './CartMessagePreview.vue'
import {Button} from '@/components/ui/button'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {useAbandonedCartFunctions} from '@/composables/useAbandonedCartFunctions'
import type {AbandonedCartDetails, CartStatus, CartMessagePreview as Preview} from '@/types/abandoned-cart'

const props = defineProps<{cartId: number | null; initialScreen?: 'details' | 'message'}>()
const emit = defineEmits<{(e: 'close'): void; (e: 'updated'): void}>()
const {getCartDetails} = useAbandonedCartFunctions()
const cart = ref<AbandonedCartDetails>()
const loading = ref(false)
const composer = ref(false)
const previewed = ref<Preview | null>(null)
const copyStatus = ref('')
const copy = async (value: string) => {try {await navigator.clipboard.writeText(value); copyStatus.value = 'Скопировано'} catch {copyStatus.value = 'Не удалось скопировать'}}
let requestVersion = 0

const load = async () => {
  const id = props.cartId
  const version = ++requestVersion
  if (id === null) return
  loading.value = true
  const result = await getCartDetails(id)
  if (version !== requestVersion) return
  cart.value = result
  loading.value = false
}

const onSent = () => {emit('updated'); composer.value = false; load()}
watch(() => props.cartId, () => {
  cart.value = undefined
  composer.value = props.initialScreen === 'message'
  previewed.value = null
  copyStatus.value = ''
  load()
}, {immediate: true})
onBeforeUnmount(() => { requestVersion++ })

const money = (value: number) => new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB', maximumFractionDigits: 2}).format(value)
const formatDate = (value: string | null) => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleString('ru-RU', {dateStyle: 'short', timeStyle: 'short'}) : '—'
const statusLabel = (status: CartStatus) => status === 'ordered' ? 'Заказ оформлен' : status === 'abandoned' ? 'Брошенная' : 'Активная'
const channelLabels: Record<string, string> = {email: 'Email', telegram: 'Telegram', max: 'MAX', vk: 'ВКонтакте', whatsapp: 'WhatsApp'}
const communicationLabels: Record<string, string> = {queued: 'В очереди', sent: 'Отправлено', failed: 'Ошибка отправки', skipped: 'Отменено'}
const channelLabel = (value: string) => channelLabels[value] || value
const communicationLabel = (value: string) => communicationLabels[value] || value
</script>
