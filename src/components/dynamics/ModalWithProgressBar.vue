<template>
  <Modal
      v-if="sending"
      v-model:dialog-open="open"
      dynamic-style="max-h-[15vh]"
  >

    <template #content>
      <ShadcnProgress
          :auto-start="true"
          :duration="5"
          :target-progress="targetProgress"
      />
    </template>

  </Modal>
</template>

<script setup lang="ts">
import Modal from './Modal.vue'
import {ref, watch} from 'vue'
import ShadcnProgress from "@/components/dynamics/ShadcnProgress.vue";


const props = defineProps<{
  sending: boolean,
  targetProgress: number,
}>()

const open = ref(true);


watch(() => props.sending, () => {
  open.value = props.sending;
})

</script>

<style lang="scss" scoped>

</style>