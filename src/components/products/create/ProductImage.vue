<template>
  <div class="flex justify-start">

    <div @click="dialogOpen = true" class="w-10 cursor-pointer">
      <Image v-if="!item.images?.length" class="text-gray-400 hover:text-gray-500 transition cursor-pointer"/>
      <img v-else :src="item.images?.length ? showImage(item.images[0]) : ''" alt="img">
    </div>

    <DynamicsModal
        :dialog-open="dialogOpen"
        @close="dialogOpen = false"
        title="Фото товара"
        dynamic-style="md:min-w-[700px] "
    >

      <template v-slot:content>
        <ProductImagePreviewAndUpload
            :item="item"
            @saveImage="dialogOpen = false"
        />
      </template>
    </DynamicsModal>
  </div>
</template>

<script setup lang="ts">
import {Image} from "lucide-vue-next";
import {Product} from "@/models/Product";
import DynamicsModal from '@/components/dynamics/Modal.vue';
import {useImageFunctions} from "@/composables/useImageFunctions";
import {ref} from "vue";
import ProductImagePreviewAndUpload from "@/components/products/create/ProductImagePreviewAndUpload.vue";

const dialogOpen = ref(false);

const emit = defineEmits(['uploaded'])

const {showImage} = useImageFunctions()

defineProps({
  item: {
    type: Product,
    default: {}
  },
});


</script>

<style scoped></style>
