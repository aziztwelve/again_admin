<template>
  <Dialog :open="open" @update:open="!$event && $emit('close')">
    <DialogContent class="left-auto right-0 top-0 flex h-dvh max-h-dvh w-full max-w-[860px] translate-x-0 translate-y-0 flex-col gap-0 rounded-none p-0 sm:rounded-none">
      <DialogHeader class="border-b px-6 py-5 pr-12"><DialogTitle>Настройки брошенных корзин</DialogTitle><DialogDescription>Три сообщения через 2, 24 и 48 часов. Шаблоны для новых и повторных клиентов.</DialogDescription></DialogHeader>
      <div class="min-h-0 flex-1 space-y-5 overflow-y-auto bg-gray-50 p-5 sm:p-6">
        <p v-if="loading" role="status" class="py-10 text-center text-sm text-gray-500">Загружаем настройки…</p>
        <div v-else-if="!settings" class="text-center"><p class="text-sm text-gray-500">Не удалось загрузить настройки.</p><Button class="mt-3" variant="outline" @click="load">Повторить</Button></div>
        <template v-else>
          <section class="space-y-4 rounded-lg border bg-white p-5">
            <h3 class="font-semibold">Общие настройки</h3>
            <label class="flex items-center gap-3 text-sm"><input v-model="settings.enabled" type="checkbox" class="h-4 w-4" />Отправлять автоматические напоминания</label>
            <p class="text-sm text-gray-600">Начало цепочки: после {{ settings.start_after_minutes }} минут неактивности.</p>
            <p class="text-sm text-gray-600">Сообщения: через 2, 24 и 48 часов от последней активности клиента.</p>
            <p class="text-xs text-gray-500">После третьего сообщения корзина становится брошенной. Оформление заказа останавливает цепочку.</p>
            <p v-if="!settings.environment_enabled" class="rounded bg-amber-50 p-3 text-xs text-amber-800">Автоматическая рассылка отключена в конфигурации сервера.</p>
          </section>
          <section class="space-y-4 rounded-lg border bg-white p-5">
            <h3 class="font-semibold">Каналы автоматической рассылки</h3>
            <div class="grid gap-3 sm:grid-cols-2"><label v-for="(label, value) in channelLabels" :key="value" class="flex items-center gap-3 text-sm"><input v-model="settings.channels[value]" type="checkbox" class="h-4 w-4" />{{ label }}</label></div>
            <p class="text-xs text-gray-500">Отправляем только при наличии контакта клиента. SMS и WhatsApp в этой цепочке не используются.</p>
          </section>
          <section class="space-y-4 rounded-lg border bg-white p-5">
            <h3 class="font-semibold">Шаблоны сообщений</h3>
            <div class="grid gap-3 sm:grid-cols-3">
              <label class="text-xs text-gray-600">Клиент<select v-model="audience" class="mt-1 block w-full rounded-md border bg-white px-2 py-2 text-sm"><option value="new">Новый</option><option value="returning">Повторный</option></select></label>
              <label class="text-xs text-gray-600">Сообщение<select v-model.number="step" class="mt-1 block w-full rounded-md border bg-white px-2 py-2 text-sm"><option :value="1">1 · 2 часа</option><option :value="2">2 · 24 часа</option><option :value="3">3 · 48 часов</option></select></label>
              <label class="text-xs text-gray-600">Канал<select v-model="channel" class="mt-1 block w-full rounded-md border bg-white px-2 py-2 text-sm"><option v-for="(label, value) in channelLabels" :key="value" :value="value">{{ label }}</option></select></label>
            </div>
            <CartTemplateEditor v-model="editor" :channel="channel" />
            <div class="flex flex-wrap items-end gap-2">
              <label class="text-xs text-gray-600">ID корзины для предпросмотра<input v-model.number="previewCartId" type="number" min="1" class="mt-1 block w-48 rounded-md border px-3 py-2 text-sm" /></label>
              <Button variant="outline" :disabled="previewing || !previewCartId" @click="preview">Предпросмотр</Button>
              <Button variant="outline" :disabled="previewing || !previewCartId" @click="editDefault">Редактировать стандартный</Button>
              <Button variant="ghost" @click="resetTemplate">Стандартный шаблон</Button>
            </div>
            <p class="text-xs text-gray-500">Предпросмотр учитывает выбранный тип клиента. Чтобы применить изменения, нажмите «Сохранить».</p>
            <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>
          </section>
        </template>
      </div>
      <footer class="flex shrink-0 justify-end gap-2 border-t bg-white px-6 py-4"><Button variant="outline" :disabled="saving" @click="$emit('close')">Закрыть</Button><Button :disabled="loading || saving || !settings" @click="save">{{ saving ? 'Сохраняем…' : 'Сохранить' }}</Button></footer>
      <CartMessagePreview :message="previewed" @close="previewed = null" />
    </DialogContent>
  </Dialog>
</template>
<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {Button} from '@/components/ui/button'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from '@/components/ui/dialog'
import CartTemplateEditor from './CartTemplateEditor.vue'
import CartMessagePreview from './CartMessagePreview.vue'
import {useAbandonedCartFunctions} from '@/composables/useAbandonedCartFunctions'
import type {CartMessageContent, CartMessageTemplate, CartMessagePreview as Preview, CartRecoverySettings as Settings} from '@/types/abandoned-cart'
const props = defineProps<{open: boolean}>()
const emit = defineEmits<{(e: 'close'): void}>()
const {getSettings, saveSettings, previewMessage} = useAbandonedCartFunctions()
const settings = ref<Settings>()
const loading = ref(false), saving = ref(false), previewing = ref(false)
const audience = ref<'new' | 'returning'>('new'), step = ref(1), channel = ref('email')
const error = ref(''), previewCartId = ref<number | null>(null), previewed = ref<Preview | null>(null)
const channelLabels: Record<string, string> = {email: 'Эл. почта', telegram: 'Telegram', max: 'MAX', vk: 'ВКонтакте'}
const matches = (template: CartMessageTemplate) => template.audience === audience.value && template.step === step.value && template.channel === channel.value
const editor = computed<CartMessageContent>({
  get: () => settings.value?.templates.find(matches) || {subject: '', body: '', format: 'text'},
  set: value => {
    if (!settings.value) return
    settings.value.templates = settings.value.templates.filter(t => !matches(t))
    settings.value.templates.push({...value, channel: channel.value, audience: audience.value, step: step.value})
  },
})
let version = 0
const load = async () => {
  const current = ++version
  loading.value = true
  const value = await getSettings()
  if (current !== version || !props.open) return
  settings.value = value; loading.value = false
}
watch(() => props.open, open => {
  version++; settings.value = undefined; previewed.value = null; error.value = ''
  if (open) load()
}, {immediate: true})
const resetTemplate = () => {if (settings.value) settings.value.templates = settings.value.templates.filter(t => !matches(t)); previewed.value = null; error.value = ''}
const preview = async () => {
  if (!previewCartId.value || previewing.value) return
  previewing.value = true
  try {previewed.value = await previewMessage({cart_id: previewCartId.value, step: step.value, channel: channel.value, audience: audience.value, ...editor.value, use_default: !editor.value.body.trim()}) || null}
  finally {previewing.value = false}
}
const editDefault = async () => {
  if (!previewCartId.value || previewing.value) return
  previewing.value = true
  const selected = `${audience.value}:${step.value}:${channel.value}`
  try {
    const result = await previewMessage({cart_id: previewCartId.value, step: step.value, channel: channel.value, audience: audience.value, use_default: true})
    if (selected === `${audience.value}:${step.value}:${channel.value}` && result?.editable_template) editor.value = result.editable_template
  } finally {previewing.value = false}
}
const save = async () => {
  if (!settings.value || saving.value) return
  error.value = ''
  const templates = settings.value.templates.filter(t => t.body.trim() || t.subject?.trim())
  if (templates.some(t => !t.body.trim() || (t.channel === 'email' && !t.subject?.trim()))) {error.value = 'Для своего шаблона заполните текст и тему письма. Для стандартного очистите оба поля.'; return}
  saving.value = true
  try {if (await saveSettings({...settings.value, templates})) emit('close')}
  finally {saving.value = false}
}
</script>
