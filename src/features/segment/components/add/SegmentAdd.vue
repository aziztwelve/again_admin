<template>
  <SegmentFormModal
      :key="renderModal"
      :form-data="formData"
      @submit-form="handleCreate"
  />
</template>

<script setup lang="ts">
import SegmentFormModal from "@/features/segment/components/form/SegmentFormModal.vue";
import {
  createSegmentFormData,
  formDataToCreateRequest,
  CreateSegmentRequest,
  SegmentFormData, Segment
} from "@/features/segment/types";

import {ref, defineEmits} from "vue";
import {useSegments} from "@/features/segment/composables/useSegments";


const emit = defineEmits<{
  (e: 'createEmit', segment: Segment): void
}>()

const {createSegment} = useSegments()

const formData = ref<SegmentFormData>(createSegmentFormData());
const renderModal = ref(1)

const handleCreate = async (): Promise<void> => {

  try {
    const prepareFData: CreateSegmentRequest = formDataToCreateRequest(formData.value)

    const segment = await createSegment(prepareFData)

    if (segment) {
      renderModal.value++
      emit('createEmit', segment)
      formData.value = createSegmentFormData()
    }

  } catch (error) {
    console.log(error)
  }
}

</script>

<style scoped>

</style>