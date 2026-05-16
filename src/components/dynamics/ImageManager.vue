<template>
  <div class="space-y-4">

    <div class="grid flex-1 items-center gap-4">
      <div class="flex flex-col space-y-1.5 p-2 cursor-pointer">
        <input
            class="block w-full text-sm text-gray-500
         file:mr-4 file:py-2 file:px-4
         file:rounded-lg file:border-0
         file:text-sm file:font-semibold
         file:bg-primary file:text-white
         hover:file:bg-primary/90
         cursor-pointer transition"
            id="image-upload"
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            @change="handleFileUpload"
        />
      </div>

      <div v-if="sortedImages.length > 0" class="space-y-2 flex-1 flex-col">
        <Label v-if="!horizontal">Список изображений</Label>
        <div :class="{'flex flex-wrap gap-2': horizontal, 'space-y-2': !horizontal}">
          <div
              v-for="(element, index) in sortedImages"
              :key="`${element.id}`"
              class="group relative hover:bg-muted/50 transition-colors border rounded-md"
              :class="{
                'w-full': !horizontal,
                'w-[150px]': horizontal,
                'opacity-50': draggedItemIndex === index,
                'drag-over': dragOverIndex === index && draggedItemIndex !== index
              }"
              draggable="true"
              @dragstart="handleDragStart($event, index)"
              @dragover.prevent="handleDragOver($event, index)"
              @dragenter.prevent="handleDragEnter($event, index)"
              @dragleave.prevent="handleDragLeave($event)"
              @drop.prevent="handleDrop($event, index)"
              @dragend.prevent="handleDragEnd"
          >
            <div :class="{'flex items-center gap-4': !horizontal, 'flex flex-col': horizontal}">
              <div class="flex-shrink-0">
                <div
                    class="cursor-pointer flex"
                    :class="{'h-20 w-24': !horizontal, 'h-[120px] w-full': horizontal}"
                    v-if="getPreviewUrl(element)"
                    @click="openImagePreview(element.position)"
                >

                  <Button
                      v-if="horizontal"
                      variant="ghost"
                      size="icon"
                      class="absolute -top-2 -right-2 h-6 w-6 text-destructive hover:text-destructive bg-background/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 max-md:opacity-100"
                      @mousedown.stop
                      @click.stop="removeImage(element.id!)"
                  >
                    <TrashIcon class="h-3 w-3"/>
                  </Button>

                  <ImagePreviewModal
                      :images="sortedImages"
                      :initialIndex="currentPreviewIndex"
                      :imageSize="imageSize"
                      :element="element"
                  />
                </div>
                <div v-else class="h-16 w-16 bg-muted flex items-center justify-center rounded-md">
                  <UploadIcon class="h-6 w-6 text-muted-foreground"/>
                </div>
              </div>

              <div class="flex-grow min-w-0" v-if="!horizontal">
                <p class="text-sm font-medium ">
                  {{ element.file?.name || element.path || 'New image' }}
                </p>
                <p class="text-xs text-muted-foreground">
                  Position: {{ element.position + 1 }}
                </p>
              </div>

              <div :class="{'flex items-center gap-1': !horizontal, 'flex justify-end': horizontal}">
                <Button
                    v-if="!horizontal"
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8"
                    @mousedown.stop
                    :disabled="element.position === 0"
                    @click="moveUp(element.id!)"
                >
                  <ArrowUpIcon class="h-4 w-4"/>
                </Button>
                <Button
                    v-if="!horizontal"
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8"
                    @mousedown.stop
                    :disabled="element.position === sortedImages.length - 1"
                    @click="moveDown(element.id!)"
                >
                  <ArrowDownIcon class="h-4 w-4"/>
                </Button>
                <Button
                    v-if="!horizontal"
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 text-destructive hover:text-destructive"
                    @mousedown.stop
                    @click="removeImage(element.id!)"
                >
                  <TrashIcon class="h-4 w-4"/>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else
           @click="triggerFileInput"
           class="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg cursor-pointer"
      >
        <UploadIcon class="h-10 w-10 text-muted-foreground mb-2"/>
        <p class="text-sm text-muted-foreground">Изображения ещё не загружены</p>
      </div>
    </div>

    <div class="flex justify-between">
      <Button v-if="showButtonSave" variant="outline" @click="emit('saveImage')">Сохранить</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch, computed} from 'vue'
import {Button} from '@/components/ui/button'
import {Label} from '@/components/ui/label'
import {TrashIcon, ArrowUpIcon, ArrowDownIcon, UploadIcon} from 'lucide-vue-next'
import {ImageModel} from "@/models/ImageModel";
import {ImageManager} from "@/models/ImageManager";
import ImagePreviewModal from "@/components/dynamics/ImagePreviewModal.vue";

const props = withDefaults(
    defineProps<{
      modelValue: ImageModel[],
      imageSize?: { value: string },
      showButtonSave?: boolean,
      horizontal?: boolean
    }>(),
    {
      showButtonSave: true,
      horizontal: false
    }
)

const showPreviewModal = ref(false)
const currentPreviewIndex = ref(0)

const openImagePreview = (index: number) => {
  currentPreviewIndex.value = index
  showPreviewModal.value = true
}

const emit = defineEmits(['update:modelValue', 'upload', 'saveImage']);

const fileInput = ref<HTMLInputElement | null>(null)
const images = ref<ImageModel[]>(props.modelValue || [])
const imageManager = new ImageManager(images.value)
const draggedItemIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

// Watch for changes in images and emit updates
watch(images, (newVal) => {
  emit('update:modelValue', newVal)
}, {deep: true})

const handleFileUpload = async (event: Event,) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const files = Array.from(input.files);

    const newImages = files.map((file, index) => {
      return new ImageModel({
        id: Date.now() + Math.random(),
        file,
        path: '',
        position: index
      });
    });

    newImages.forEach(img => imageManager.addImage(img));
    images.value = imageManager.getAllImages();

    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
}

const removeImage = (id: number) => {
  imageManager.removeImage(id)
  images.value = imageManager.getAllImages()
}

const moveUp = (id: number) => {
  imageManager.moveUp(id)
  images.value = imageManager.getAllImages()
}

const moveDown = (id: number) => {
  imageManager.moveDown(id)
  images.value = imageManager.getAllImages()
}

const getPreviewUrl = (image: ImageModel) => {
  if (image.file) {
    return URL.createObjectURL(image.file);
  }


  if (image.path) {
    return props.imageSize
        ? image.imageURL(props.imageSize)
        : image.path;
  }
  return '';
}

const sortedImages = computed({
  get: () => [...images.value].sort((a, b) => a.position - b.position),
  set: (newVal) => {
    images.value = newVal
    imageManager.normalizePositions()
  }
})

const handleDragStart = (event: DragEvent, index: number) => {
  draggedItemIndex.value = index;
  event.dataTransfer?.setData('text/plain', index.toString());
  event.dataTransfer!.effectAllowed = 'move';

  const dragImage = new Image();
  dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  event.dataTransfer?.setDragImage(dragImage, 0, 0);

  (event.currentTarget as HTMLElement).classList.add('dragging');
}

const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault();
  dragOverIndex.value = index;
  event.dataTransfer!.dropEffect = 'move';
}

const handleDragEnter = (event: DragEvent, index: number) => {
  event.preventDefault();
  dragOverIndex.value = index;
}
const handleDragLeave = (event: DragEvent) => {
  const element = event.currentTarget as HTMLElement;
  if (!element.contains(event.relatedTarget as Node)) {
    element.classList.remove('drag-over');
    dragOverIndex.value = null;
  }
}
const handleDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault();
  const dragIndex = Number(event.dataTransfer?.getData('text/plain'));

  if (isNaN(dragIndex) || dragIndex === dropIndex) return;

  const newItems = [...sortedImages.value];
  const [movedItem] = newItems.splice(dragIndex, 1);
  newItems.splice(dropIndex, 0, movedItem);

  imageManager.setImages(newItems);
  images.value = imageManager.getAllImages();

  resetDragState();
}

const handleDragEnd = () => {
  resetDragState();
}

const resetDragState = () => {
  draggedItemIndex.value = null;
  dragOverIndex.value = null;
  document.querySelectorAll('.dragging, .drag-over').forEach(el => {
    el.classList.remove('dragging', 'drag-over');
  });
}
</script>

<style>
.dragging {
  opacity: 0.5;
  background-color: rgba(0, 0, 0, 0.1);
  pointer-events: none;
}

.drag-over {
  border: 2px dashed #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
  position: relative;
}

.drag-over::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #3b82f6;
}
</style>