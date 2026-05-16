<template>
  <SegmentForm
      :form-data="formData"
      :show-submit-button="false"
  />
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import SegmentForm from "@/features/segment/components/form/SegmentForm.vue"
import {Segment, SegmentFormData, segmentToFormData, syncFormDataToSegment} from "@/features/segment/types"

interface SegmentFormDataProps {
  item: Segment
}

const props = defineProps<SegmentFormDataProps>()

const formData = ref<SegmentFormData>(segmentToFormData(props.item))

watch(formData, (newFormData) => {
  syncFormDataToSegment(newFormData, props.item)
}, {deep: true})

</script>

<style scoped></style>