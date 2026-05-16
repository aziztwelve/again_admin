<template>
  <DialogModal
      @dialog-open="dialogOpen"
  >
    <template #button>
      <IconButtons :buttons="[
          {type: 'edit'}
      ]"/>
    </template>

    <template #content>
      <Loader v-if="sending"/>

      <DiscountForm
          submit-button-name="Сохранить"
          :form-data="discount"
          @submit-form="handleSaveToServe"
      />

    </template>

  </DialogModal>
</template>

<script setup lang="ts">
import DialogModal from "@/components/dynamics/shadcn/DialogModal.vue";
import {onMounted, ref} from "vue";
import IconButtons from "@/components/dynamics/IconButtons.vue";
import {Product} from "@/models/Product";
import DiscountForm from "@/components/discount/DiscountForm.vue";
import {Discount} from "@/models/Discount";
import {useDiscountFunctions} from "@/composables/useDiscountFunctions";

const emit = defineEmits(["update"]);

const props = defineProps({
  discount: {
    type: Discount,
    required: true
  }
})

const discount = ref<Discount>(props.discount?.clone());



onMounted(() => {
  console.log(props.discount);
})


let products: Product[] = [];

const {sending, updateDiscount} = useDiscountFunctions()

const dialogOpen = async (param: boolean) => {

  // console.log(props.discount);


}


const handleSaveToServe = async () => {

  const result = await updateDiscount(discount.value);

  if (result) {
    emit('update');
  }

}

</script>

<style scoped>

</style>