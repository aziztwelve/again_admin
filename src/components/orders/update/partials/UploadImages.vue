<template>
  <div class="space-y-4">
    <div
        class="border-dashed border-2 p-4 cursor-pointer text-center rounded-lg"
        @dragover.prevent
        @drop="handleDrop"
        @click="triggerFileInput"
    >
      <input type="file" ref="fileInput" multiple accept="image/jpeg, image/png, image/jpg, image/gif" class="hidden"
             @change="handleFiles"/>
      <p class="text-gray-500">
        Перетащите файлы сюда или нажмите, чтобы выбрать. Допустимые форматы: JPEG, PNG, JPG.
      </p>
    </div>
    <div v-if="images.length || product.images?.length"
         class="grid grid-cols-3 gap-4 border border-gray-300 rounded-lg p-2">
      <div v-for="(image, index) in images" :key="index" class="relative border border-gray-300 rounded-lg">
        <img :src="image" alt="uploaded" class="rounded-lg w-24 h-24 object-cover"/>
        <button type="button" @click="removeImage(index)"
                class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
          ×
        </button>
      </div>
      <div v-for="(img, i) in product.images" :key="i" class="relative border border-gray-300 rounded-lg">
        <img :src="`${back_url}/products/${product.id}/image?path=${img.path}`" alt="image"

             class="rounded-lg w-24 h-24 object-cover"/>
        <button type="button" @click="removeImageToBack(i, img)"
                class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {Product} from "@/models/Product";
import {Button} from "@/components/ui/button";
import axios from "axios";
import {toast} from 'vue-sonner'

const back_url = ref(process.env.VUE_APP_BASE_URL)

const product = defineModel<Product>('product');

const images = ref<string[]>([]);

const fileInput = ref<HTMLInputElement | null>(null);

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files) {
    const filesList = event.dataTransfer.files;
    processFiles(filesList);
  }
};

const handleFiles = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const filesList = target.files;
    processFiles(filesList);
  }
};

const processFiles = (filesList: FileList) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];

  for (let i = 0; i < filesList.length; i++) {
    const file = filesList[i];

    if (!allowedTypes.includes(file.type)) {
      toast.error(`Файл "${file.name}" не является допустимым изображением. Разрешены только форматы: jpeg, png, jpg, gif.`);
      continue;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        images.value.push(e.target?.result as string); // Сохраняем base64
      };
      reader.readAsDataURL(file);
      product.value.imageFiles.push(file); // Сохраняем файл
    }
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const removeImage = (index: number) => {
  images.value.splice(index, 1); // Удаляем base64
  product.value.imageFiles.splice(index, 1); // Удаляем файл
};

const removeImageToBack = async (index: number, image: any) => {
  product.value.images.splice(product.value.images.indexOf(index), 1);

  await axios.delete(`/products/${product.value.id}/images/${image.id}`)
      .then(res => {
        toast('Фото удалено!', {
          description: 'Изображение товара было успешно удалено.',
          action: {
            label: 'удалено',
          },
        })
      })
};
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
}
</style>