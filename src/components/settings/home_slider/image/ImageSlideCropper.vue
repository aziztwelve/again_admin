<template>
  <div class="max-w-full">
    <Cropper
        ref="cropper"
        :src="src"
        :stencil-props="{
        aspectRatio: aspectRatio,
        movable: true,
        resizable: true,
      }"
        :resize-image="{ preserveRatio: true }"
        @change="onChange"
    />
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {Cropper} from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const props = defineProps({
  src: {type: String, required: true}
})

const cropper = ref(null)
const aspectRatio = 1920 / 920

const onChange = ({coordinates, canvas}) => {
  if (canvas) {
    const base64 = canvas.toDataURL('image/jpeg')
  }
}
</script>

<style scoped>
img, canvas {
  max-width: 100% !important;
  max-height: 100% !important;
  object-fit: contain; /* чтобы сохранять пропорции */
}

</style>