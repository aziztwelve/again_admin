<template>
  <div @click="dialogOpen = true" class="cursor-pointer">
    <img
        :src="showImage(element)"
        alt="Uploaded image"
        class="object-cover rounded-md border w-full h-full"
    />
  </div>

  <DynamicsModal
      :dialog-open="dialogOpen"
      @close="dialogOpen = false"
      title=""
      dynamic-style="md:min-w-[60vw] flex items-center justify-center "
  >
    <template v-slot:content>
      <swiper
          class="h-full w-full"
          :key="initialIndex"
          :initial-slide="initialIndex"
          :modules="modules"
          :slides-per-view="1"
          :navigation="true"
          :pagination="{ clickable: true }"
      >
        <swiper-slide
            v-for="(image, index) in images"
            :key="index"
            class="flex items-center justify-center h-full max-w-full"
        >
          <div class="w-full h-full flex items-center justify-center">
            <img
                :src="showImage(image, ImageSize.ORIGINAL)"
                :alt="image.file?.name || image.path || 'Image'"
                class="h-full max-w-full object-contain"
            />
          </div>
        </swiper-slide>
      </swiper>
    </template>
  </DynamicsModal>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {Swiper, SwiperSlide} from 'swiper/vue'
import {Navigation, Pagination} from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import {useImageFunctions} from '@/composables/useImageFunctions'
import {ImageModel} from '@/models/ImageModel'
import DynamicsModal from '@/components/dynamics/Modal.vue'
import {ImageSize} from "@/constants/ImageSize";

const dialogOpen = ref(false)
const modules = [Navigation, Pagination]

const emit = defineEmits(['uploaded'])

const {showImage} = useImageFunctions()

const props = defineProps<{
  images: ImageModel[]
  initialIndex: number
  imageSize?: { value: string }
  element: ImageModel
}>()
</script>
