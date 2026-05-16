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
  src: {type: String, required: true},
  aspectRatio: {
    type: Number,
    default: 1920 / 920,
  },
})

const emit = defineEmits(['update:file']) // событие для родителя
const cropper = ref(null)

const onChange = ({coordinates, canvas}) => {
  if (canvas) {
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'cropped-image.jpg', {type: 'image/jpeg'})
        emit('update:file', file)
      }
    }, 'image/jpeg')
  }
}
</script>


<style scoped>
img, canvas {
  max-width: 100% !important;
  max-height: 100% !important;
  object-fit: contain;
}

</style>