<template>
  <DialogModal
    @dialog-open="dialogOpen"
    title="Редактировать акцию"
    description="Измените параметры акции"
  >
    <template #button>
      <IconButtons :buttons="[{ type: 'edit' }]" />
    </template>

    <template #content>
      <Loader v-if="sending" />

      <div v-else>
        <div v-if="validationErrors.length > 0" class="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p class="text-sm font-medium text-red-800 mb-2">Ошибки валидации:</p>
          <ul class="list-disc list-inside text-sm text-red-700 space-y-1">
            <li v-for="(error, index) in validationErrors" :key="index">{{ error }}</li>
          </ul>
        </div>
        <PromotionForm
          submit-button-name="Сохранить"
          :form-data="promotionData"
          @submit-form="handleSaveToServe"
          @validation-errors="handleValidationErrors"
        />
      </div>
    </template>
  </DialogModal>
</template>

<script setup lang="ts">
import DialogModal from "@/components/dynamics/shadcn/DialogModal.vue";
import { ref, nextTick } from "vue";
import IconButtons from "@/components/dynamics/IconButtons.vue";
import PromotionForm from "@/components/discount/Promotion/PromotionForm.vue";
import { Promotion } from "@/models/Promotion";
import Loader from "@/components/common/Loader.vue";
import { usePromotionFunctions } from "@/composables/usePromotionFunctions";
import { useErrorHandler } from "@/composables/useErrorHandler";

const emit = defineEmits(["update"]);

const props = defineProps({
  promotion: {
    type: Promotion,
    required: true,
  },
});

const promotionData = ref<Promotion>(props.promotion.clone());

const { updatePromotion, sending } = usePromotionFunctions();
const { getValidationErrors, formatValidationErrors } = useErrorHandler();
const validationErrors = ref<string[]>([]);

const dialogOpen = () => {
  promotionData.value = props.promotion.clone();
  validationErrors.value = [];
};

const handleSaveToServe = async () => {
  validationErrors.value = [];
  
  const result = await updatePromotion(promotionData.value);

  if (result.success) {
    emit("update");
  } else if (result.errors) {
    validationErrors.value = formatValidationErrors(result.errors);
    await scrollToErrors();
  }
};

const handleValidationErrors = async (errors: string[]) => {
  validationErrors.value = errors;
  if (errors.length > 0) {
    await scrollToErrors();
  }
};

const scrollToErrors = async () => {
  await nextTick();
  const errorBlock = document.querySelector('.bg-red-50');
  if (errorBlock) {
    errorBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
</script>

<style scoped></style>
