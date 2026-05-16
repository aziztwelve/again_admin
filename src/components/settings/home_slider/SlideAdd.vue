<template>
  <Loader v-if="sending"/>
  <SlideForm
      :form-data="item"
      :show-button="true"
      @submit-form="handleCreate"
  />
</template>

<script setup lang="ts">
import SlideForm from "@/components/settings/home_slider/SlideForm.vue";
import HomeSlider from "@/models/HomeSlider";
import {ref} from "vue";
import {useHomeSlideFunctions} from "@/composables/useHomeSlideFunctions";

const emit = defineEmits(["created"]);

const item = ref(HomeSlider.fromJSON({}))
const {createSlide, sending} = useHomeSlideFunctions()

const handleCreate = async () => {
  const result = await createSlide(item.value)
  if (result) {
    emit("created", result)
  }
}

</script>


<style scoped>

</style>