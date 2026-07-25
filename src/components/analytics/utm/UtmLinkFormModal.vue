<template>
  <DialogModal ref="modalRef" :title="editingId ? 'Редактировать UTM-метку' : 'Создать UTM-метку'">
    <template #button>
      <span class="hidden"></span>
    </template>

    <template #content>
      <div class="space-y-3">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Название метки *</label>
          <Input v-model="form.name" placeholder="Например: Блогер1 в Instagram"/>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Канал маркетинга *</label>
            <select v-model="form.marketing_channel_id" class="w-full h-9 rounded-md border border-gray-300 px-2 text-sm bg-white">
              <option :value="null" disabled>Выберите канал</option>
              <option v-for="c in channels" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Тег</label>
            <select v-model="form.utm_tag_id" class="w-full h-9 rounded-md border border-gray-300 px-2 text-sm bg-white">
              <option :value="null">Без тега</option>
              <option v-for="t in tags" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Целевая страница (URL) *</label>
          <Input v-model="form.target_url" placeholder="https://site.ru/catalog"/>
        </div>

        <details class="text-sm">
          <summary class="cursor-pointer text-gray-600 select-none">Дополнительные UTM-параметры</summary>
          <div class="grid grid-cols-2 gap-3 mt-2">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">utm_medium</label>
              <Input v-model="form.utm_medium" placeholder="cpc, social…"/>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">utm_campaign</label>
              <Input v-model="form.utm_campaign" placeholder="summer_sale"/>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">utm_content</label>
              <Input v-model="form.utm_content"/>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">utm_term</label>
              <Input v-model="form.utm_term"/>
            </div>
          </div>
        </details>

        <!-- Сгенерированная ссылка (после сохранения) -->
        <div v-if="createdLink" class="rounded-md bg-gray-50 border border-gray-200 p-3">
          <label class="block text-xs font-medium text-gray-600 mb-1">Ссылка для раздачи</label>
          <div class="flex items-center gap-2">
            <code class="flex-1 truncate text-xs text-gray-700">{{ createdLink.tracking_url }}</code>
            <Button size="sm" variant="outline" @click="copy(createdLink.tracking_url)">
              <Copy class="h-4 w-4 mr-1"/>
              Копировать
            </Button>
          </div>
        </div>

        <!-- Длинную ссылку показываем только в карточке уже созданной метки. -->
        <div v-if="editingLink" class="rounded-md bg-gray-50 border border-gray-200 p-3">
          <label class="block text-xs font-medium text-gray-600 mb-1">Длинная ссылка с UTM-параметрами</label>
          <div class="flex items-center gap-2">
            <code class="flex-1 truncate text-xs text-gray-700">{{ editingLink.target_url_with_params }}</code>
            <Button size="sm" variant="outline" @click="copy(editingLink.target_url_with_params)">
              <Copy class="h-4 w-4 mr-1"/>
              Копировать
            </Button>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <Button variant="outline" @click="modalRef?.closeModal()">Закрыть</Button>
      <Button :disabled="sending || !isValid" @click="save">
        {{ editingId ? 'Сохранить' : 'Создать' }}
      </Button>
    </template>
  </DialogModal>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Copy} from 'lucide-vue-next'
import {toast} from 'vue-sonner'
import DialogModal from '@/components/dynamics/shadcn/DialogModal.vue'
import {useUtmFunctions} from '@/composables/useUtmFunctions'
import {initialUtmLinkForm} from '@/types/utm'
import type {CreateUtmLinkRequest, MarketingChannel, UtmLink, UtmTag} from '@/types/utm'

defineProps<{
  channels: MarketingChannel[]
  tags: UtmTag[]
}>()

const emit = defineEmits<{
  (e: 'saved'): void
}>()

const {createLink, updateLink, sending} = useUtmFunctions()

const modalRef = ref<{ closeModal: () => void; openModal: () => void } | null>(null)
const form = ref<CreateUtmLinkRequest>({...initialUtmLinkForm})
const editingId = ref<number | null>(null)
const createdLink = ref<UtmLink | null>(null)
const editingLink = ref<UtmLink | null>(null)

const isValid = computed(() =>
    !!form.value.name && !!form.value.marketing_channel_id && !!form.value.target_url
)

const openCreate = () => {
  editingId.value = null
  createdLink.value = null
  editingLink.value = null
  form.value = {...initialUtmLinkForm}
  modalRef.value?.openModal()
}

const openEdit = (link: UtmLink) => {
  editingId.value = link.id
  createdLink.value = null
  editingLink.value = link
  form.value = {
    name: link.name,
    marketing_channel_id: link.marketing_channel_id,
    utm_tag_id: link.utm_tag_id,
    target_url: link.target_url,
    utm_medium: link.utm_medium,
    utm_campaign: link.utm_campaign,
    utm_content: link.utm_content,
    utm_term: link.utm_term,
    is_active: link.is_active,
  }
  modalRef.value?.openModal()
}

const save = async () => {
  try {
    if (editingId.value) {
      await updateLink(editingId.value, form.value)
      emit('saved')
      modalRef.value?.closeModal()
    } else {
      const link = await createLink(form.value)
      createdLink.value = link
      emit('saved')
      // оставляем модалку открытой, чтобы показать ссылку для копирования
    }
  } catch (e) {
    // ошибка уже показана обработчиком
  }
}

const copy = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    toast.success('Ссылка скопирована в буфер')
  } catch (e) {
    toast.error('Не удалось скопировать ссылку')
  }
}

defineExpose({openCreate, openEdit})
</script>
