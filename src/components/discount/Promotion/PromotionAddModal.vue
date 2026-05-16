<template>
  <DialogModal
    title="Добавить новую акцию"
    description="Создайте новую акцию для клиентов"
  >
    <template #button>
      <Button variant="outline" class="max-md:w-full">Добавить</Button>
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
          :formData="promotion"
          @submit-form="handleSaveToServe"
          @validation-errors="handleValidationErrors"
        />
      </div>
    </template>
  </DialogModal>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import DialogModal from "@/components/dynamics/shadcn/DialogModal.vue";
import { ref, nextTick } from "vue";
import PromotionForm from "@/components/discount/Promotion/PromotionForm.vue";
import { Promotion } from "@/models/Promotion";
import Loader from "@/components/common/Loader.vue";
import { usePromotionFunctions } from "@/composables/usePromotionFunctions";
import { useErrorHandler } from "@/composables/useErrorHandler";

const emit = defineEmits(["created"]);

const promotion = ref<Promotion>(
  Promotion.fromJSON({
    name: "",
    description: "",
    starts_at: new Date().toISOString(),
    ends_at: new Date().toISOString(),
    min_purchase_amount: null,
    allow_promo_codes: false,
    is_active: true,
    priority: 10,
    max_uses: null,
    times_used: 0,
    trigger_products: [],
    gift_products: [],
  }),
);

const { createPromotion, sending } = usePromotionFunctions();
const { formatValidationErrors } = useErrorHandler();
const validationErrors = ref<string[]>([]);
const errorBlockRef = ref<HTMLElement | null>(null);

const handleSaveToServe = async () => {
  validationErrors.value = [];
  
  const result = await createPromotion(promotion.value.toJSON());

  if (result.success) {
    emit("created");
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
