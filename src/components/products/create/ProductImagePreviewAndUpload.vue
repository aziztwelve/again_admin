<template>
  <Loader v-if="isLoading"/>
  <ImageManager
      v-else
      v-model="images"
      :image-size="{
        value: 'md'
      }"
      @saveImage="saveImage"
  />
  <ShadcnProgress
      class="mt-2"
      v-if="isUploading"
      :target-progress="uploadProgress"
      :auto-start="true"
  />
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {ImageModel} from '@/models/ImageModel'
import {Product} from "@/models/Product";
import {useImageFunctions} from '@/composables/useImageFunctions';
import ImageManager from "@/components/dynamics/ImageManager.vue";
import ShadcnProgress from "@/components/dynamics/ShadcnProgress.vue";
import {toast} from "vue-sonner";

const {uploadImage, getImages, deleteImage} = useImageFunctions();

const emits = defineEmits(['uploaded', 'saveImage']);

const isUploading = ref(false);
const uploadProgress = ref(50)

const isLoading = ref(true)

const props = defineProps({
  item: {
    type: Product,
    required: true
  },
})

const images = ref<ImageModel[]>([]);


const saveImage = async () => {

  props.item.images = images.value;
  emits("saveImage", images.value);
  toast.success('Фото варианта сохронены')

};

onMounted(async () => {
  // await fetchImages();

  let arrImg: ImageModel[] = []
  props.item?.images.forEach((image) => {
    arrImg.push(ImageModel.fromJSON(image))

  })

  images.value = arrImg;
  console.log(images.value);
  isLoading.value = false
});
</script>
