<template>
  <div class="space-y-4">
    <div
        class="border-dashed border-2 p-4 cursor-pointer text-center rounded-lg"
        @dragover.prevent
        @drop="handleDrop"
        @click="triggerFileInput"
    >
      <input type="file" ref="fileInput" multiple accept="image/*" class="hidden" @change="handleFiles" />
      <p class="text-gray-500">Перетащите файлы сюда или нажмите, чтобы выбрать</p>
    </div>
    <div v-if="images.length" class="grid grid-cols-3 gap-4 border border-gray-300 rounded-lg p-2">
      <div v-for="(image, index) in images" :key="index" class="relative border border-gray-300 rounded-lg">
        <img :src="image" alt="uploaded" class="rounded-lg w-24 h-24 object-cover" />
        <button @click="removeImage(index)" class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const images = ref([]);
const fileInput = ref(null);

const handleDrop = (event) => {
  event.preventDefault();
  const files = event.dataTransfer.files;
  processFiles(files);
};

const handleFiles = (event) => {
  const files = event.target.files;
  processFiles(files);
};

const processFiles = (files) => {
  for (let file of files) {
    const reader = new FileReader();
    reader.onload = (e) => {
      images.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const removeImage = (index) => {
  images.value.splice(index, 1);
};
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
}
</style>
