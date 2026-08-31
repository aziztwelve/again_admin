<template>
  <div class="w-full space-y-3 rounded-md border border-dashed p-3 text-sm">
    <div>
      <p class="font-medium">Клиент не сохранён</p>
      <p class="text-xs text-muted-foreground">
        Номер чата: {{ conversation.external_id || `#${conversation.id}` }}
      </p>
    </div>

    <form class="space-y-2" @submit.prevent="saveClient">
      <Input v-model.trim="form.last_name" placeholder="Фамилия" required />
      <Input v-model.trim="form.first_name" placeholder="Имя" required />
      <Input v-model.trim="form.middle_name" placeholder="Отчество" />
      <Input v-model.trim="form.phone" type="tel" placeholder="Контакт" />
      <Input v-model.trim="form.email" type="email" placeholder="Email" required />
      <Button class="w-full" size="sm" type="submit" :disabled="saving">
        <Loader2 v-if="saving" class="mr-1 h-4 w-4 animate-spin" />
        Сохранить клиента
      </Button>
    </form>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue'
import axios from 'axios'
import {toast} from 'vue-sonner'
import {Loader2} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import type {Conversation} from '@/types/conversation'
import type {Client} from '@/types/client'

const props = defineProps<{ conversation: Conversation }>()

const emit = defineEmits<{ (e: 'created', client: Client): void }>()

const chatContact = () => {
  if (props.conversation.source === 'email') return props.conversation.external_id || ''
  if (props.conversation.source === 'whatsapp') return (props.conversation.external_id || '').replace(/@c\.us$/i, '')
  return ''
}

const form = reactive({
  first_name: '',
  last_name: '',
  middle_name: '',
  phone: chatContact(),
  email: props.conversation.source === 'email' ? props.conversation.external_id || '' : '',
})
const saving = ref(false)

const saveClient = async () => {
  saving.value = true
  try {
    const {data: created} = await axios.post('/clients', form)
    const client = created.client as Client
    const {data: attached} = await axios.post(`/conversations/${props.conversation.id}/client`, {
      client_id: client.id,
    })

    emit('created', attached.client as Client)
    toast.success('Клиент сохранён и привязан к диалогу')
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || 'Не удалось сохранить клиента'
      : 'Не удалось сохранить клиента'
    toast.error(message)
  } finally {
    saving.value = false
  }
}
</script>
