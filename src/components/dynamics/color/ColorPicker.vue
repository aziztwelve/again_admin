<template>
  <div class="flex flex-wrap gap-2">
    <div
        v-for="color in colors"
        :key="color.id"
        class="w-6 h-6 rounded-full cursor-pointer transition-all"
        :class="[modelValue === color.hex ? 'ring-2 ring-offset-2 ring-primary' : '']"
        :style="{ backgroundColor: color.hex }"
        @click="updateValue(color.hex)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: null
  },
  colors: {
    type: Array,
    default: () => [
      {id: 1, hex: '#ef4444', name: 'Red'},
      {id: 2, hex: '#f97316', name: 'Orange'},
      {id: 3, hex: '#eab308', name: 'Yellow'},
      {id: 4, hex: '#22c55e', name: 'Green'},
      {id: 5, hex: '#3b82f6', name: 'Blue'},
      {id: 6, hex: '#8b5cf6', name: 'Violet'},
      {id: 7, hex: '#ec4899', name: 'Pink'},
      {id: 8, hex: '#161af9', name: 'Dark Blue'},
      {id: 9, hex: '#ededed', name: 'Light Grey'},
      {id: 10, hex: '#66ff00', name: 'Lime'},
      {id: 11, hex: '#2b7600', name: 'Dark Grey'},
      {id: 12, hex: '#930000', name: 'Purple'},
      {id: 13, hex: '#09806d', name: 'Teal'},
      {id: 14, hex: '#ff1493', name: 'Deep Pink'},
      {id: 15, hex: '#00ced1', name: 'Dark Turquoise'},
      {id: 17, hex: '#708090', name: 'Slate Grey'},
      {id: 19, hex: '#556b2f', name: 'Olive Green'},
      {id: 20, hex: '#20b2aa', name: 'Light Sea Green'}
    ]
  }
})

const emit = defineEmits(['update:modelValue'])

const updateValue = (hex) => {
  emit('update:modelValue', hex)
}
</script>
