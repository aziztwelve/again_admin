<template>
  <SlideForm
      :form-data="props.item"
  />
</template>

<script setup lang="ts">
import SlideForm from "@/components/settings/home_slider/SlideForm.vue";
import HomeSlider from "@/models/HomeSlider";

const props = defineProps({
  item: HomeSlider
})


</script>


<style scoped>

</style>