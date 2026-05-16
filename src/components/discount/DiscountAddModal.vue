<template>
  <DialogModal
      title="Добавить новую скидку"
  >
    <template #button>
      <Button variant="outline" class="max-md:w-full">Добавить</Button>
    </template>

    <template #content>
      <Loader v-if="sending"/>
      <DiscountForm
          v-else
          :formData="discount"
          @submit-form="handleSaveToServe"
      />
    </template>

  </DialogModal>
</template>

<script setup lang="ts">
import {Button} from "@/components/ui/button";
import DialogModal from "@/components/dynamics/shadcn/DialogModal.vue";
import {ref} from "vue";
import DiscountForm from "@/components/discount/DiscountForm.vue";
import {Discount} from "@/models/Discount";
import {useDiscountFunctions} from "@/composables/useDiscountFunctions";

const emit = defineEmits(["created"]);

const discount = ref<Discount>(Discount.fromJSON({
  starts_at: new Date(),
  ends_at: new Date(),
}));

const {createDiscount, sending} = useDiscountFunctions()

const handleSaveToServe = async () => {

  const success = await createDiscount(discount.value.toJSON())

  if (success) {
    emit('created')
  }
}

</script>

<style scoped>

</style>