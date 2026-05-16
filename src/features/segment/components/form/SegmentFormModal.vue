<template>
  <ModalDialog
      dynamic-style="md:min-w-[50%]"
  >
    <template #trigger>
      <Button variant="outline">
        {{ props.buttonName || 'Создать сегмент' }}
      </Button>
    </template>

    <template #content>
      <SegmentForm
          :form-data="formData"
          :submit-button-text="'Создать'"
          @submit-form="emit('submitForm')"
      />
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import ModalDialog from "@/components/dynamics/shadcn/ModalDialog.vue";
import SegmentForm from "@/features/segment/components/form/SegmentForm.vue";
import {SegmentFormData} from "@/features/segment/types";
import {Button} from "@/components/ui/button";


interface SegmentFormProps {
  formData: SegmentFormData
  buttonName?: string
}

const props = defineProps<SegmentFormProps>()

const emit = defineEmits<{
  submitForm: void
}>()


</script>

<style scoped></style>