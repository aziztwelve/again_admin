<template>
  <Dialog :open="isOpen" @update:open="close">
    <DialogContent class="max-w-[90vw] h-[90vh]">
      <Swiper
          :initialSlide="initialIndex"
          :modules="[Navigation, Pagination]"
          :navigation="true"
          :pagination="{ clickable: true }"
          class="h-full"
      >
        <SwiperSlide v-for="(image, index) in images" :key="index" >
          <div class="flex items-center justify-center h-full max-w-full">
            <img
                :src="showImage(image)"
                :alt="image.file?.name || image.path || 'Image'"
                class="max-h-full max-w-full"
            />
          </div>
        </SwiperSlide>
      </Swiper>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {Dialog, DialogContent} from '@/components/ui/dialog'
import {Swiper, SwiperSlide} from 'swiper/vue'

import {Navigation, Pagination} from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import {ImageModel} from "@/models/ImageModel"
import {onMounted, ref} from "vue";
import {useImageFunctions} from "@/composables/useImageFunctions";

const props = defineProps<{
  images: ImageModel[]
  initialIndex: number
  imageSize?: { value: string }
}>()

const emit = defineEmits(['close'])

const isOpen = ref(true)

const {showImage} = useImageFunctions()


const close = () => {
  isOpen.value = false
  emit('close')
}

onMounted(() => {
  console.log(props.images)
})

</script>