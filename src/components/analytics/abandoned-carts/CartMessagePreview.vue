<template>
  <Dialog :open="!!message" @update:open="!$event && $emit('close')">
    <DialogContent class="flex max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-2xl flex-col">
      <DialogHeader><DialogTitle>Предпросмотр сообщения</DialogTitle><DialogDescription>Письмо не отправляется. Подставлен текущий состав выбранной корзины.</DialogDescription></DialogHeader>
      <p v-if="message?.subject" class="border-b pb-3 text-sm"><span class="text-gray-500">Тема:</span> {{ message.subject }}</p>
      <iframe v-if="message?.html" :srcdoc="documentHtml" sandbox="" referrerpolicy="no-referrer" title="Содержимое письма" class="min-h-[360px] w-full flex-1 rounded-md border bg-white" />
      <pre v-else class="min-h-0 overflow-y-auto whitespace-pre-wrap break-words text-sm">{{ message?.body }}</pre>
      <div class="flex justify-end"><Button variant="outline" @click="$emit('close')">Закрыть</Button></div>
    </DialogContent>
  </Dialog>
</template>
<script setup lang="ts">
import {computed} from 'vue'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import type {CartMessagePreview} from '@/types/abandoned-cart'
const props = defineProps<{message: CartMessagePreview | null}>()
defineEmits<{(e: 'close'): void}>()
const documentHtml = computed(() => `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'"><style>body{font:14px/1.6 Arial,sans-serif;margin:20px;overflow-wrap:anywhere;color:#202631}a{color:#2563eb}table{max-width:100%}</style></head><body>${props.message?.html || ''}</body></html>`)
</script>
