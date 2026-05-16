<template>
  <OtoBannerFormModal
      :key="renderModal"
      :form-data="formData"
      @submit-form="handleCreate"
  />
</template>

<script setup lang="ts">
import OtoBannerFormModal from "../form/OtoBannerFormModal.vue"
import {
  createOtoBannerFormData,
  formDataToCreateRequest,
  OtoBanner
} from "@/features/oto-banner/types"

import { ref } from "vue"
import { useOtoBanners } from "@/features/oto-banner/composables/useOtoBanners"

const emit = defineEmits<{
  (e: 'createEmit', banner: OtoBanner): void
}>()

const { createOtoBanner } = useOtoBanners()

const formData = ref(createOtoBannerFormData())
const renderModal = ref(1)

const handleCreate = async (): Promise<void> => {
  try {
    const preparedFormData = formDataToCreateRequest(formData.value)
    const banner = await createOtoBanner(preparedFormData)

    if (banner) {
      renderModal.value++
      emit('createEmit', banner)
      formData.value = createOtoBannerFormData()
    }

  } catch (error) {
    console.log(error)
  }
}

</script>

<style scoped>

</style>