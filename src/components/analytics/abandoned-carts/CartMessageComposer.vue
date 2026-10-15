<template>
  <div class="space-y-5 p-5 sm:p-6">
    <section class="rounded-lg border bg-white p-5">
      <p class="font-medium">{{ cart.customer.name || 'Клиент' }}</p><p class="mt-1 text-sm text-gray-500">{{ cart.customer.email || cart.customer.phone }}</p>
      <p class="mt-4 text-sm">Корзина #{{ cart.id }} · {{ cart.status === 'ordered' ? 'Заказ оформлен' : 'Не оформлена' }}</p>
    </section>
    <section class="space-y-4 rounded-lg border bg-white p-5">
      <h3 class="font-semibold">Сообщение</h3>
      <p v-if="loading" role="status" class="text-sm text-gray-500">Загружаем шаблоны…</p>
      <template v-else>
        <label class="block text-sm">Канал<select v-model="channel" class="mt-1 block w-full rounded-md border bg-white px-3 py-2"><option v-for="item in cart.available_channels" :key="item" :value="item">{{ labels[item] || item }}</option></select></label>
        <label class="block text-sm">Шаблон<select v-model.number="step" class="mt-1 block w-full rounded-md border bg-white px-3 py-2"><option :value="1">Сообщение 1 · 2 часа</option><option :value="2">Сообщение 2 · 24 часа</option><option :value="3">Сообщение 3 · 48 часов</option><option :value="0">Своё сообщение</option></select></label>
        <CartTemplateEditor v-model="draft" :channel="channel" />
        <p v-if="cart.status === 'ordered'" class="rounded bg-gray-50 p-3 text-xs text-gray-500">Корзина уже оформлена. Можно написать личное сообщение; напоминание о незавершённом оформлении недоступно.</p>
        <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>
        <div class="flex flex-wrap justify-end gap-2">
          <Button variant="outline" :disabled="busy || !channel" @click="preview">Предпросмотр</Button>
          <Button :disabled="busy || !channel" @click="send">{{ sending ? 'Отправляем…' : 'Отправить' }}</Button>
        </div>
      </template>
    </section>
    <CartMessagePreview :message="previewed" @close="previewed = null" />
  </div>
</template>
<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {Button} from '@/components/ui/button'
import CartTemplateEditor from './CartTemplateEditor.vue'
import CartMessagePreview from './CartMessagePreview.vue'
import {useAbandonedCartFunctions} from '@/composables/useAbandonedCartFunctions'
import type {AbandonedCartDetails, CartMessageContent, CartMessagePreview as Preview, CartRecoverySettings} from '@/types/abandoned-cart'
const props = defineProps<{cart: AbandonedCartDetails}>()
const emit = defineEmits<{(e: 'sent'): void}>()
const {getSettings, previewMessage, sendReminder} = useAbandonedCartFunctions()
const settings = ref<CartRecoverySettings>()
const channel = ref(props.cart.available_channels[0] || '')
const step = ref(props.cart.status === 'ordered' ? 0 : 1)
const draft = ref<CartMessageContent>({subject: '', body: '', format: 'text'})
const loading = ref(true), sending = ref(false), previewing = ref(false)
const busy = computed(() => loading.value || sending.value || previewing.value)
const error = ref('')
const previewed = ref<Preview | null>(null)
const labels: Record<string, string> = {email: 'Эл. почта', telegram: 'Telegram', max: 'MAX', vk: 'ВКонтакте'}
let editorVersion = 0
const selectTemplate = async () => {
  const current = ++editorVersion
  loading.value = true
  const audience = props.cart.orders_count ? 'returning' : 'new'
  const template = settings.value?.templates.find(t => t.channel === channel.value && t.audience === audience && t.step === step.value)
  let value: CartMessageContent = template ? {subject: template.subject || '', body: template.body, format: template.format} : {subject: '', body: '', format: 'text'}
  if (!template && step.value && channel.value) {
    const result = await previewMessage({cart_id: props.cart.id, step: step.value, channel: channel.value, use_default: true})
    if (result?.editable_template) value = result.editable_template
  }
  if (current !== editorVersion) return
  draft.value = value
  previewed.value = null; error.value = ''
  loading.value = false
}
watch([channel, step], selectTemplate)
onMounted(async () => {settings.value = await getSettings(); await selectTemplate()})
onBeforeUnmount(() => {editorVersion++})
const validate = () => {
  error.value = ''
  if (!channel.value) error.value = 'У клиента нет доступного канала.'
  else if ((!step.value || props.cart.status === 'ordered') && !draft.value.body.trim()) error.value = 'Напишите текст личного сообщения.'
  else if (draft.value.subject.trim() && !draft.value.body.trim()) error.value = 'Добавьте текст своего сообщения или очистите тему для стандартного сценария.'
  else if (draft.value.body.trim() && channel.value === 'email' && !draft.value.subject.trim()) error.value = 'Укажите тему письма.'
  return !error.value
}
const preview = async () => {
  if (!validate() || busy.value) return
  previewing.value = true
  try {previewed.value = await previewMessage({cart_id: props.cart.id, step: step.value || 1, channel: channel.value, ...draft.value}) || null}
  finally {previewing.value = false}
}
const send = async () => {
  if (!validate() || busy.value) return
  sending.value = true
  try {
    if (await sendReminder(props.cart.id, channel.value, draft.value.body.trim() || undefined, draft.value.subject.trim() || undefined, draft.value.format, step.value || 1, step.value === 0)) emit('sent')
  } finally {sending.value = false}
}
</script>
