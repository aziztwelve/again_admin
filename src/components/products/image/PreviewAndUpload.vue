<template>
  <Loader v-if="isLoading"/>
  <DynamicsImageManager
      v-else
      v-model="images"
      :image-size="{
        value: 'md'
      }"
      @upload="uploadToServer"
  />

  <DynamicsShadcnProgress
      class="mt-2"
      v-if="isUploading"
      :target-progress="uploadProgress"
      :auto-start="true"
  />
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {ImageModel} from '~/services/ImageModel'
import {Product} from "~/services/Product";
import {useImageFunctions} from '~/composables/useImageFunctions';

const {uploadImage, getImages, deleteImage} = useImageFunctions();


const emits = defineEmits(['uploaded'])

const isUploading = ref(false);
const uploadProgress = ref(50)

const isLoading = ref(true)
const props = defineProps({
  item: {
    type: Product,
    required: true
  }
})

const images = ref<ImageModel[]>([]);

const fetchImages = async () => {
  images.value = await getImages('Product', props.item.id);
};


const uploadToServer = async () => {

  const imagesToUpload = images.value.map(img => ({
    file: img.file,
    name: img.path
  }));

  isUploading.value = true;

  try {
    await uploadImage(
        'Product',
        props.item.id,
        imagesToUpload,
        (progress) => {
          uploadProgress.value = progress;
        }
    );
  } finally {
    isUploading.value = false;
    emits('uploaded')
  }
};

onMounted(async () => {
  await fetchImages();
  isLoading.value = false
});
</script>
