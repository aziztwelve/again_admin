<template>
  <ModalDialog
      dynamic-style="md:min-w-[60%]"
  >
    <template #trigger>
      <Button variant="outline">
        {{ props.buttonName || 'Создать баннер' }}
      </Button>
    </template>

    <template #content>
      <OtoBannerForm
          :form-data="formData"
          :submit-button-text="'Создать'"
          @submit-form="emit('submitForm')"
      />
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import ModalDialog from "@/components/dynamics/shadcn/ModalDialog.vue"
import OtoBannerForm from "./OtoBannerForm.vue"
import { OtoBannerFormData } from "@/features/oto-banner/types"
import { Button } from "@/components/ui/button"

interface OtoBannerFormModalProps {
  formData: OtoBannerFormData
  buttonName?: string
}

const props = defineProps<OtoBannerFormModalProps>()

const emit = defineEmits<{
  (e: 'submitForm'): void
}>()

</script>

<style scoped></style>