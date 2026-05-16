<template>
  <PromoForm
      :form-data="props.item"
  />
</template>

<script setup lang="ts">
import PromoForm from "@/components/discount/Promo/PromoForm.vue";
import {PromoCode} from "@/models/PromoCode";

const props = defineProps({
  item: PromoCode
})


</script>


<style scoped>

</style>