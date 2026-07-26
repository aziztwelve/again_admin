<template>
  <DialogModal ref="modalRef" title="Заявка: скоро в продаже">
    <template #button><span class="hidden"/></template>

    <template #content>
      <div v-if="subscription" class="space-y-5 text-sm">
        <section class="grid grid-cols-1 gap-3 rounded-md border border-gray-200 p-3 sm:grid-cols-2">
          <div><p class="text-xs text-gray-500">Товар</p><p class="font-medium">{{ subscription.product?.name ?? '—' }}</p></div>
          <div><p class="text-xs text-gray-500">Цвета</p><p>{{ subscription.colors?.length ? subscription.colors.map(color => color.name).join(', ') : 'Все цвета' }}</p></div>
          <div><p class="text-xs text-gray-500">Статус</p><p>{{ statusLabel }}</p></div>
          <div><p class="text-xs text-gray-500">Покупатель</p><p>{{ subscription.name || '—' }}</p></div>
          <div><p class="text-xs text-gray-500">Контакты</p><p>{{ subscription.email }}<span v-if="subscription.phone"> · {{ subscription.phone }}</span></p></div>
          <div><p class="text-xs text-gray-500">Создана</p><p>{{ formatDate(subscription.created_at) }}</p></div>
          <div v-if="subscription.client_id">
            <p class="text-xs text-gray-500">Клиент</p>
            <button class="text-red-600 hover:underline" type="button" @click="openClient">Открыть карточку клиента</button>
          </div>
        </section>

        <section class="rounded-md border border-gray-200 p-3">
          <div class="flex items-center justify-between gap-2">
            <h3 class="font-semibold text-gray-900">Комментарий менеджера</h3>
            <button v-if="!editing" class="text-gray-500 hover:text-gray-900" type="button" title="Изменить комментарий" @click="startEdit">
              <Pencil class="h-4 w-4"/>
            </button>
          </div>
          <template v-if="editing">
            <textarea v-model="draft" rows="4" class="mt-3 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-red-500" placeholder="Внутренний комментарий (не виден покупателю)" @keydown.esc.prevent="cancelEdit"/>
            <div class="mt-2 flex gap-2">
              <Button size="sm" :disabled="saving" @click="save">{{ saving ? 'Сохранение…' : 'Сохранить' }}</Button>
              <Button size="sm" variant="outline" :disabled="saving" @click="cancelEdit">Отмена</Button>
            </div>
          </template>
          <p v-else class="mt-2 whitespace-pre-line text-gray-700">{{ subscription.manager_comment || 'Нет комментария' }}</p>
        </section>

        <section class="rounded-md border border-gray-200 p-3">
          <h3 class="font-semibold text-gray-900">История действий</h3>
          <ul v-if="subscription.history?.length" class="mt-3 space-y-3">
            <li v-for="entry in subscription.history" :key="entry.id" class="border-l-2 border-gray-200 pl-3">
              <p class="text-gray-800">{{ entry.description }}</p>
              <p class="mt-0.5 text-xs text-gray-500">{{ formatDate(entry.created_at) }}<span v-if="entry.user"> · {{ entry.user.name }}</span></p>
            </li>
          </ul>
          <p v-else class="mt-2 text-gray-500">Нет записей</p>
        </section>
      </div>
    </template>

    <template #footer><Button variant="outline" @click="modalRef?.closeModal()">Закрыть</Button></template>
  </DialogModal>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {useRouter} from 'vue-router'
import {Pencil} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import DialogModal from '@/components/dynamics/shadcn/DialogModal.vue'
import {useRestockSubscriptionFunctions, type RestockSubscription} from '@/composables/useRestockSubscriptionFunctions'

const emit = defineEmits<{ (e: 'saved'): void }>()
const router = useRouter()
const {getRestockSubscription, updateRestockSubscription, sending: saving} = useRestockSubscriptionFunctions()
const modalRef = ref<{ closeModal: () => void; openModal: () => void } | null>(null)
const subscription = ref<RestockSubscription | null>(null)
const editing = ref(false)
const draft = ref('')

const statusLabel = computed(() => subscription.value?.status === 'notified' ? 'Уведомлён' : 'Ожидает')

const open = async (id: number) => {
  const data = await getRestockSubscription(id)
  if (!data) return
  subscription.value = data
  editing.value = false
  modalRef.value?.openModal()
}

const startEdit = () => {
  draft.value = subscription.value?.manager_comment ?? ''
  editing.value = true
}

const cancelEdit = () => {
  editing.value = false
  draft.value = ''
}

const save = async () => {
  if (!subscription.value) return
  const data = await updateRestockSubscription(subscription.value.id, {manager_comment: draft.value.trim() || null})
  if (!data) return
  subscription.value = data
  editing.value = false
  emit('saved')
}

const openClient = () => {
  if (!subscription.value?.client_id) return
  modalRef.value?.closeModal()
  router.push(`/clients/${subscription.value.client_id}`)
}

const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat('ru-RU', {dateStyle: 'short', timeStyle: 'short'}).format(new Date(value)) : '—'

defineExpose({open})
</script>
