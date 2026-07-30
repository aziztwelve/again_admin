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

        <input
            type="file"
            multiple
            accept="image/*"
            class="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
            :disabled="uploading"
            @change="upload"
        />

        <div v-if="uploading" class="flex items-center gap-2 rounded-md border p-3 text-sm text-muted-foreground">
          <Loader2 class="h-4 w-4 animate-spin"/>
          Фото добавляются{{ uploadTotal ? `: ${uploadDone}/${uploadTotal}` : '...' }}
        </div>

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
            <Loader2 v-if="attaching" class="mr-2 h-4 w-4 animate-spin"/>
            {{ attaching ? 'Добавление...' : 'Добавить' }}
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
import {Loader2} from 'lucide-vue-next'

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
const uploading = ref(false)
const uploadDone = ref(0)
const uploadTotal = ref(0)
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

const upload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const selectedFiles = Array.from(input.files ?? [])
  if (!props.productId || !selectedFiles.length) return

  uploading.value = true
  uploadDone.value = 0
  uploadTotal.value = selectedFiles.length
  try {
    let images: ImageModel[] = []

    for (const file of selectedFiles) {
      const formData = new FormData()
      formData.append('files[]', file, file.name)
      if (props.targetVariantId) {
        formData.append('variant_id', String(props.targetVariantId))
      }

      const {data} = await axios.post(`/products/${props.productId}/media-library/attach`, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      })
      images = (data.data ?? []).map((image: any) => ImageModel.fromJSON(image))
      uploadDone.value++
    }

    emit('update:modelValue', images)
    emit('attached', images)
    toast.success('Фото загружены')
    await load()
  } catch (error: any) {
    toast.error(error.response?.data?.message ?? 'Не удалось загрузить фото')
  } finally {
    uploading.value = false
    uploadDone.value = 0
    uploadTotal.value = 0
    input.value = ''
  }
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
