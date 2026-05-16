<template>

  <div v-if="permission">
    <slot/>
  </div>


  <div v-else
       class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-700 bg-rose-100/80 rounded-lg border border-rose-200/60"
  >
    <span>У вас нет доступа</span>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import usePermission from '@/composables/usePermission'
import {toast} from "vue-sonner";

const props = defineProps({
  permission: {
    type: Boolean,
    required: true,
    default: false,
  },

})


</script>