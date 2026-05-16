<template>
  <DialogModal
      title="Управление промокодами клиента"
      description="Нажмите на ✔, чтобы добавить промокод клиенту."
      dynamic-style="2xl:min-w-[80vw] xl:min-w-[95vw] max-md:min-w-full md:min-w-[95vw]"
  >
    <template #button>
      <Button variant="outline" class="max-md:w-full">Управление промокодами клиента</Button>
    </template>

    <template #content>
      <Loader v-if="sending"/>
      <PromoCodeForAddToClient
          :promoCodeClientIds="promoCodeClientIds"
          :client="client"
          @created="emit('created', $event)"
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
import {Client} from "@/models/client/Client";
import PromoCodeForAddToClient from "@/components/clients/Promo/PromoCodeForAddToClient.vue";

const props = defineProps({
  client: Client,
  promoCodeClientIds: Array
})

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
