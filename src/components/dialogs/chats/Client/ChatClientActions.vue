<template>
  <div>
    <h3 class="text-sm font-medium mb-3">Действия</h3>
    <div class="space-y-2">
      <Button
          variant="outline"
          class="w-full justify-start"
          size="sm"
          @click="handleCall"
          :disabled="!client?.profile?.phone"
      >
        <Phone class="w-4 h-4 mr-2"/>
        Позвонить
      </Button>

      <Button
          variant="outline"
          class="w-full justify-start"
          size="sm"
          @click="handleEmail"
          :disabled="!client?.email"
      >
        <Mail class="w-4 h-4 mr-2"/>
        Написать на почту
      </Button>

      <!-- В шаблоне -->

<!--      <Button-->
<!--          variant="outline"-->
<!--          class="w-full justify-start"-->
<!--          size="sm"-->
<!--          @click="handleTelegram"-->
<!--          :disabled="true"-->
<!--      >-->
<!--        <Send class="w-4 h-4 mr-2"/>-->
<!--        Написать в Telegram-->
<!--      </Button>-->

      <Button
          variant="outline"
          class="w-full justify-start"
          size="sm"
          @click="handleVK"
          :disabled="conversation?.source !== 'vk'"
      >
        <MessageCircle class="w-4 h-4 mr-2"/>
        Написать ВКонтакте
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {Button} from "@/components/ui/button"
import {Mail, Phone, Send, MessageCircle} from "lucide-vue-next"
import {Client} from "@/types/client"
import {Conversation} from "@/types/conversation";

interface Props {
  client: Client
  conversation?: Conversation
}

const props = defineProps<Props>()

// Проверяем, есть ли доступ к Telegram
const hasTelegramAccess = computed(() => {
  return !!(props.client?.profile?.telegram_user_id || props.client?.profile?.telegram_chat_id)
})

const handleCall = () => {
  if (props.client?.profile?.phone) {
    window.location.href = `tel:${props.client.profile.phone}`
  }
}

const handleEmail = () => {
  if (props.client?.email) {
    window.location.href = `mailto:${props.client.email}`
  }
}

// В <script setup>

const handleTelegram = () => {
  const profile = props.client?.profile

  // Вариант 1 — самый надёжный (если есть номер телефона)
  if (profile?.phone) {
    // Убираем всё кроме цифр и плюса
    const cleanPhone = profile.phone.replace(/[^\d+]/g, '')
    window.open(`https://t.me/+${cleanPhone}`, '_blank')
    return
  }


  // Вариант 3 — fallback на user_id (откроет профиль, а не чат)
  if (profile?.telegram_user_id) {
    window.open(`https://t.me/id${profile.telegram_user_id}`, '_blank')
    // или просто https://t.me/${profile.telegram_user_id} — но это тоже профиль
  }
}

const handleVK = () => {
  const vkId = props.conversation?.external_id
  if (!vkId) return

  window.open(`https://vk.com/write${vkId}`, '_blank')
}
</script>

<style scoped>

</style>