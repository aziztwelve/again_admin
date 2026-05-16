<template>
  <DialogModal
      title="Добавить новый промокод"
      dynamic-style="2xl:min-w-[50vw] xl:min-w-[65vw] max-md:min-w-full md:min-w-[95vw]"
  >
    <template #button>
      <Button variant="outline" class="max-md:w-full">Добавить</Button>
    </template>

    <template #content>
      <Loader v-if="sending"/>
      <PromoForm
          v-else
          :formData="promoCode"
          :submit-button-button="true"
          @submit-form="handleSaveToServer"
      />
    </template>
  </DialogModal>
</template>

<script setup lang="ts">
import {Button} from "@/components/ui/button";
import DialogModal from "@/components/dynamics/shadcn/DialogModal.vue";
import {ref} from "vue";
import {PromoCode} from "@/models/PromoCode";
import {usePromoCodeFunctions} from "@/composables/usePromoCodeFunctions";
import PromoForm from "@/components/discount/Promo/PromoForm.vue";
import {Product} from "@/models/Product";

const emit = defineEmits(["created"]);


const promoCode = ref<PromoCode>(PromoCode.fromJSON({
  isActive: true,
  startsAt: new Date(),
  expiresAt: new Date(),
}));


const {createPromoCode, sending} = usePromoCodeFunctions();

const handleSaveToServer = async () => {

  const success = await createPromoCode(promoCode.value.toFormData());

  if (success) {
    emit("created");
  }
};
</script>
