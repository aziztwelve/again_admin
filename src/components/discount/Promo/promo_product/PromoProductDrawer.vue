<template>
  <div>
    <DynamicDrawer>

      <template #buttonTrigger>
        <Button type="button" variant="outline">Выбрать товар</Button>
      </template>

        <PromoProductList
            :promo-code="props.promoCode"
        />

    </DynamicDrawer>
  </div>
</template>
<script setup lang="ts">
import DynamicDrawer from "@/components/dynamics/shadcn/DynamicDrawer.vue";
import Button from "@/components/ui/button/Button.vue";
import PromoProductList from "@/components/discount/Promo/promo_product/PromoProductList.vue";
import {PromoCode} from "@/models/PromoCode";
import {Product} from "@/models/Product";

const emits = defineEmits(["selectedProducts"]);

const props = defineProps({
  promoCode: {
    type: PromoCode,
    required: false,
  },
})

</script>
<style scoped>

</style>