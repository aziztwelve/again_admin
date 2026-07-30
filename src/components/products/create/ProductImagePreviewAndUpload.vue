<template>
  <Loader v-if="isLoading"/>
  <div v-else class="space-y-3">
    <MediaLibraryPicker
        v-if="productId"
        v-model="images"
        :product-id="productId"
        :target-variant-id="targetVariantId"
    />
    <DraftMediaLibraryPicker
        v-else-if="product"
        v-model="images"
        :product="product"
        :target-uuid="item.uuid"
        target-type="variant"
    />
    <ImageManager
        v-model="images"
        :image-size="{
          value: 'md'
        }"
        :show-upload="false"
        @saveImage="saveImage"
        @remove-image="deleteImageFromServer"
    />
  </div>
  <ShadcnProgress
      class="mt-2"
      v-if="isUploading"
      :target-progress="uploadProgress"
      :auto-start="true"
  />
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import {ImageModel} from '@/models/ImageModel'
import {Product} from "@/models/Product";
import {useImageFunctions} from '@/composables/useImageFunctions';
import ImageManager from "@/components/dynamics/ImageManager.vue";
import ShadcnProgress from "@/components/dynamics/ShadcnProgress.vue";
import {toast} from "vue-sonner";
import MediaLibraryPicker from "@/components/products/edit/MediaLibraryPicker.vue";
import DraftMediaLibraryPicker from "@/components/products/create/DraftMediaLibraryPicker.vue";
import axios from "axios";

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
  product: {
    type: Product,
    default: null
  },
})

const images = ref<ImageModel[]>([]);

const productId = props.item.product_id ?? props.item.id;
const targetVariantId = props.item.product_id ? props.item.id : null;

watch(images, (newImages) => {
  props.item.images = newImages;
}, {deep: true})

const saveImage = async () => {

  props.item.images = images.value;
  emits("saveImage", images.value);
  toast.success('Фото варианта сохронены')

};

const deleteImageFromServer = async (image: any) => {
  if (!productId || !image?.id || image?.file instanceof File) return

  try {
    await axios.delete(`/products/${productId}/media-library/images/${image.id}`, {
      params: {
        variant_id: targetVariantId,
      },
    })
    toast.success(targetVariantId ? 'Фото варианта удалено' : 'Фото товара удалено')
  } catch (error: any) {
    toast.error(error.response?.data?.message ?? 'Не удалось удалить фото')
  }
}

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
