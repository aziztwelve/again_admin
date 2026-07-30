<template>
  <Button type="button" variant="outline" :disabled="!files.length" @click="open = true">
    Выбрать из медиатеки
  </Button>

  <Dialog :open="open" @update:open="open = $event">
    <DialogContent class="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Медиатека товара</DialogTitle>
      </DialogHeader>

      <div class="space-y-3">
        <p class="text-sm text-muted-foreground">
          Показаны фото, уже добавленные в этой форме товара и его вариантов.
        </p>

        <div v-if="!files.length" class="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          Добавьте фото товара или варианта, чтобы выбрать его здесь.
        </div>

        <div v-else class="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">
          <button
              v-for="file in files"
              :key="file.key"
              type="button"
              class="relative overflow-hidden rounded-md border bg-background text-left transition"
              :class="selectedKeys.includes(file.key) ? 'ring-2 ring-primary' : 'hover:border-primary/60'"
              @click="toggle(file.key)"
          >
            <img :src="imageUrl(file.image)" class="h-24 w-full object-cover" alt="image"/>
            <span class="block truncate px-2 py-1 text-xs text-muted-foreground">
              {{ file.label }}
            </span>
          </button>
        </div>

        <div class="flex justify-end gap-2">
          <Button type="button" variant="outline" @click="open = false">
            Отмена
          </Button>
          <Button type="button" :disabled="!selectedKeys.length" @click="attach">
            Добавить
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {Button} from '@/components/ui/button'
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {ImageModel} from '@/models/ImageModel'
import {Product} from '@/models/Product'
import {useImageFunctions} from '@/composables/useImageFunctions'

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

const attach = () => {
  const selectedImages = files.value
      .filter((file) => selectedKeys.value.includes(file.key))
      .map((file, index) => copyImage(file.image, (props.modelValue ?? []).length + index))

  emit('update:modelValue', [...(props.modelValue ?? []), ...selectedImages])
  selectedKeys.value = []
  open.value = false
}
</script>
