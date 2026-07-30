<template>
  <Button type="button" variant="outline" :disabled="!productId" @click="open = true">
    Выбрать из медиатеки
  </Button>

  <Dialog :open="open" @update:open="open = $event">
    <DialogContent class="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Медиатека товара</DialogTitle>
      </DialogHeader>

      <div class="space-y-3">
        <p class="text-sm text-muted-foreground">
          Показаны только фото этой карточки: общие фото товара и фото всех его вариантов.
        </p>

        <div v-if="loading" class="text-sm text-muted-foreground">
          Загрузка...
        </div>

        <div v-else-if="!files.length" class="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          В этой карточке пока нет фото для медиатеки.
        </div>

        <div v-else class="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">
          <button
              v-for="file in files"
              :key="file.id"
              type="button"
              class="relative overflow-hidden rounded-md border bg-background text-left transition"
              :class="selectedIds.includes(file.id) ? 'ring-2 ring-primary' : 'hover:border-primary/60'"
              @click="toggle(file.id)"
          >
            <img :src="imageUrl(file)" class="h-24 w-full object-cover" alt="image"/>
            <span class="block truncate px-2 py-1 text-xs text-muted-foreground">
              {{ file.source_type === 'variant' ? 'Вариант' : 'Товар' }}: {{ file.source_name || file.source_id }}
            </span>
          </button>
        </div>

        <div class="flex justify-end gap-2">
          <Button type="button" variant="outline" @click="open = false">
            Отмена
          </Button>
          <Button type="button" :disabled="!selectedIds.length || attaching" @click="attach">
            Добавить
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import axios from 'axios'
import {toast} from 'vue-sonner'
import {Button} from '@/components/ui/button'
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {ImageModel} from '@/models/ImageModel'
import {useImageFunctions} from '@/composables/useImageFunctions'

const props = defineProps<{
  productId: number | null
  targetVariantId?: number | null
  modelValue?: any[]
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: ImageModel[]): void
  (event: 'attached', value: ImageModel[]): void
}>()

const {showImage} = useImageFunctions()

const open = ref(false)
const loading = ref(false)
const attaching = ref(false)
const files = ref<any[]>([])
const selectedIds = ref<number[]>([])

const load = async () => {
  if (!props.productId) return

  loading.value = true
  try {
    const {data} = await axios.get(`/products/${props.productId}/media-library`)
    files.value = data.data ?? []
  } catch (error: any) {
    toast.error(error.response?.data?.message ?? 'Не удалось загрузить медиатеку')
  } finally {
    loading.value = false
  }
}

watch(open, async (value) => {
  if (!value) return
  selectedIds.value = []
  await load()
})

const toggle = (id: number) => {
  selectedIds.value = selectedIds.value.includes(id)
      ? selectedIds.value.filter((selectedId) => selectedId !== id)
      : [...selectedIds.value, id]
}

const imageUrl = (file: any) => {
  return file.path ? showImage(ImageModel.fromJSON(file), 'md') : file.url
}

const attach = async () => {
  if (!props.productId || !selectedIds.value.length) return

  attaching.value = true
  try {
    const {data} = await axios.post(`/products/${props.productId}/media-library/attach`, {
      image_ids: selectedIds.value,
      variant_id: props.targetVariantId || null,
    })
    const images = (data.data ?? []).map((image: any) => ImageModel.fromJSON(image))
    emit('update:modelValue', images)
    emit('attached', images)
    toast.success('Фото добавлены из медиатеки')
    open.value = false
  } catch (error: any) {
    toast.error(error.response?.data?.message ?? 'Не удалось добавить фото')
  } finally {
    attaching.value = false
  }
}
</script>
