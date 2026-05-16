<template>
  <DialogModal
      title="Товары"
      @dialog-open="emit('dialogOpen')"
      dynamic-style="md:min-w-[80%] md:min-h-[50vh]"
  >
    <template #button>
      <IconButtons :buttons="[
          {type: 'view'}
      ]"/>
    </template>

    <template #content>
      <PromoStatisticShowOrderDetails
          :items="data"
      />
    </template>

  </DialogModal>
</template>

<script setup lang="ts">
import DialogModal from "@/components/dynamics/shadcn/DialogModal.vue";
import {PropType, ref, watch} from "vue";
import IconButtons from "@/components/dynamics/IconButtons.vue";
import type {Product} from "@/models/Product";
import PromoStatisticShowOrderDetails
  from "@/components/discount/PromoStatistic/Show/PromoStatisticShowOrderDetails.vue";

const emit = defineEmits(["dialogOpen"]);

const props = defineProps({
  data: {
    type: Array as PropType<Product[]>,
    required: true
  }
})


</script>

<style scoped>

</style>
