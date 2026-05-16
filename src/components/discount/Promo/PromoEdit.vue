<template>
  <PromoForm
      :form-data="props.item"
  />
</template>

<script setup lang="ts">
import PromoForm from "@/components/discount/Promo/PromoForm.vue";
import {PromoCode} from "@/models/PromoCode";
import {onMounted} from "vue";
import {usePromoCodeProductFunctions} from "@/composables/usePromoCodeProductFunctions";

const props = defineProps({
  item: PromoCode
})

const {getProductsByPromoCode} = usePromoCodeProductFunctions()

onMounted(async () => {
  if (!props.item?.applies_to_all_products) {


    props.item.selected_products = await getProductsByPromoCode({
      promo_code_id: props.item?.id,
      withVariants: true
        })

  }
})

</script>


<style scoped>

</style>