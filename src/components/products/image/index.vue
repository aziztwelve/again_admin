<template>
  <div class="flex justify-start ">

    <div @click="dialogOpen = true" class="w-10 cursor-pointer">
      <img :src="useImageFunctions().getImageByName(item.image_name, 'sm')" alt="img">
    </div>
    <!--    <Image class="text-gray-400 hover:text-gray-500 transition cursor-pointer"/>-->

    <DynamicsModal
        :dialog-open="dialogOpen"
        @close="dialogOpen = false"
        title="Фото товара"
    >

      <template v-slot:content>
        <ProductImagePreviewAndUpload
            :item="item"
            @uploaded="emit('uploaded'); dialogOpen = false"
        />
      </template>
    </DynamicsModal>
  </div>
</template>

<script setup lang="ts">
import {Image} from "lucide-vue-next";
import {Product} from "~/services/Product";

const dialogOpen = ref(false);

const emit = defineEmits(['uploaded'])

const props = defineProps({
  item: {
    type: Product,
    default: {}
  },
});


</script>

<style scoped></style>
