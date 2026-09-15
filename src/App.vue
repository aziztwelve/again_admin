<template>
  <Toaster/>
  <router-view/>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import {Toaster} from '@/components/ui/sonner'
import store from '@/store'
import { ECHO_CHANNELS, ECHO_EVENTS } from '@/config/echoConfig'

interface ConversationUpdatedEvent {
  conversation_id: number
  source: string
  message_id?: number
  message_direction?: 'incoming' | 'outgoing'
  message_preview?: string
  client_name?: string | null
}

const route = useRoute()
const router = useRouter()
const receivedMessageIds = new Set<number>()

const sourceNames: Record<string, string> = {
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  web_chat: 'Веб-чат',
  vk: 'ВКонтакте',
  max: 'MAX',
  email: 'Почта',
}

function isOpenedConversation(conversationId: number): boolean {
  return route.path === '/dialogs/chats'
    && Number(route.query.conversation) === conversationId
}

function openConversation(conversationId: number) {
  router.push({
    path: '/dialogs/chats',
    query: { conversation: String(conversationId) },
  })
}

function handleConversationUpdated(event: ConversationUpdatedEvent) {
  // Событие приходит и для ответов менеджера — уведомляем только о сообщениях
  // от клиента. Старые события без message_id остаются совместимыми.
  if (event.message_direction !== 'incoming' || !event.message_id) return
  if (receivedMessageIds.has(event.message_id)) return

  receivedMessageIds.add(event.message_id)
  if (receivedMessageIds.size > 100) {
    receivedMessageIds.delete(receivedMessageIds.values().next().value!)
  }

  void store.dispatch('notifications/checkForUpdates')

  if (isOpenedConversation(event.conversation_id)) return

  toast(`Новое сообщение · ${sourceNames[event.source] ?? event.source}`, {
    description: `${event.client_name || `Чат №${event.conversation_id}`}: ${event.message_preview || 'Вложение'}`,
    action: {
      label: 'Открыть диалог',
      onClick: () => openConversation(event.conversation_id),
    },
    duration: 10_000,
  })
}

onMounted(() => {
  const echo = (window as any).Echo
  if (!echo) return

  echo.private(ECHO_CHANNELS.ADMIN_NOTIFICATIONS)
    .listen(ECHO_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated)
})

onBeforeUnmount(() => {
  const echo = (window as any).Echo
  echo?.private(ECHO_CHANNELS.ADMIN_NOTIFICATIONS)
    .stopListening(ECHO_EVENTS.CONVERSATION_UPDATED)
})
</script>
