<template>
  <Button type="button" variant="outline" @click="open = true">
    Медиатека
  </Button>

  <Dialog :open="open" @update:open="open = $event">
    <DialogScrollContent class="max-w-3xl max-md:my-0 max-md:min-h-[100dvh] max-md:w-full max-md:border-0 max-md:p-4 max-md:rounded-none">
      <DialogHeader>
        <DialogTitle>Медиатека товара</DialogTitle>
      </DialogHeader>

      <div class="flex min-h-0 flex-1 flex-col gap-3">
        <p class="text-sm text-muted-foreground">
          Показаны фото, уже добавленные в этой форме товара и его вариантов.
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
          Фото добавляются...
        </div>

        <div v-if="!files.length" class="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          Добавьте фото здесь или в другом блоке этой карточки.
        </div>

        <div v-else class="grid grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 md:grid-cols-5 max-md:max-h-[calc(100dvh-290px)]">
          <button
              v-for="file in files"
              :key="file.key"
              type="button"
              class="relative overflow-hidden rounded-md border bg-background text-left transition max-md:min-h-[150px]"
              :class="selectedKeys.includes(file.key) ? 'ring-2 ring-primary' : 'hover:border-primary/60'"
              @click="toggle(file.key)"
          >
            <img :src="imageUrl(file.image)" class="h-24 w-full object-cover max-md:h-28" alt="image"/>
            <span class="block truncate px-2 py-1 text-xs text-muted-foreground max-md:whitespace-normal max-md:break-words">
              {{ file.label }}
            </span>
          </button>
        </div>

        <div class="sticky bottom-0 -mx-4 mt-auto flex justify-end gap-2 border-t bg-background p-4 sm:static sm:mx-0 sm:border-0 sm:p-0">
          <Button type="button" variant="outline" class="max-md:flex-1" @click="open = false">
            Отмена
          </Button>
          <Button type="button" class="max-md:flex-1" :disabled="!selectedKeys.length || attaching" @click="attach">
            <Loader2 v-if="attaching" class="mr-2 h-4 w-4 animate-spin"/>
            {{ attaching ? 'Добавление...' : 'Добавить' }}
          </Button>
        </div>
      </div>
    </DialogScrollContent>
  </Dialog>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {Button} from '@/components/ui/button'
import {Dialog, DialogHeader, DialogScrollContent, DialogTitle} from '@/components/ui/dialog'
import {ImageModel} from '@/models/ImageModel'
import {Product} from '@/models/Product'
import {useImageFunctions} from '@/composables/useImageFunctions'
import {Loader2} from 'lucide-vue-next'

const props = defineProps<{
  modelValue: ImageModel[]
  product: Product
  targetUuid?: string | null
  targetType?: 'product' | 'variant'
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: ImageModel[]): void
}>()

type DraftFile = {
  key: string
  label: string
  image: ImageModel
}

const {showImage} = useImageFunctions()

const open = ref(false)
const selectedKeys = ref<string[]>([])
const uploading = ref(false)
const attaching = ref(false)

const files = computed<DraftFile[]>(() => {
  const result: DraftFile[] = []

  if (props.targetType !== 'product') {
    ;(props.product.images ?? []).forEach((image, index) => {
      result.push({
        key: `product-${image.id ?? index}`,
        label: 'Товар',
        image: ImageModel.fromJSON(image),
      })
    })
  }

  ;(props.product.variants ?? []).forEach((variant) => {
    if (variant.uuid === props.targetUuid) return

    ;(variant.images ?? []).forEach((image, index) => {
      result.push({
        key: `variant-${variant.uuid}-${image.id ?? index}`,
        label: `Вариант: ${variant.name || variant.uuid || ''}`,
        image: ImageModel.fromJSON(image),
      })
    })
  })

  return result.filter((file) => file.image.file || file.image.path)
})

const toggle = (key: string) => {
  selectedKeys.value = selectedKeys.value.includes(key)
      ? selectedKeys.value.filter((selectedKey) => selectedKey !== key)
      : [...selectedKeys.value, key]
}

const imageUrl = (image: ImageModel) => {
  return showImage(image, 'md')
}

const copyImage = (image: ImageModel, position: number) => {
  return new ImageModel({
    id: Date.now() + Math.random(),
    file: image.file,
    path: image.path ?? '',
    position,
  })
}

const upload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  uploading.value = true
  const newImages = Array.from(input.files ?? []).map((file, index) => {
    return new ImageModel({
      id: Date.now() + Math.random(),
      file,
      path: '',
      position: (props.modelValue ?? []).length + index,
    })
  })

  if (newImages.length) {
    emit('update:modelValue', [...(props.modelValue ?? []), ...newImages])
  }

  input.value = ''
  requestAnimationFrame(() => {
    uploading.value = false
  })
}

const attach = () => {
  attaching.value = true
  const selectedImages = files.value
      .filter((file) => selectedKeys.value.includes(file.key))
      .map((file, index) => copyImage(file.image, (props.modelValue ?? []).length + index))

  emit('update:modelValue', [...(props.modelValue ?? []), ...selectedImages])
  selectedKeys.value = []
  requestAnimationFrame(() => {
    attaching.value = false
    open.value = false
  })
}
</script>
