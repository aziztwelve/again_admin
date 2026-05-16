<template>
  <OtoBannerForm
      :form-data="props.item"
      :submit-button-text="'Сохранить'"
      :show-submit-button="false"
      @submit-form="emit('submitForm')"
  />
</template>

<script setup lang="ts">
import OtoBannerForm from '../form/OtoBannerForm.vue'
import type {OtoBannerFormData} from '@/features/oto-banner/types'

interface Props {
  item: OtoBannerFormData
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'submitForm'): void
}>()

</script>

<style scoped>

</style>