<template>
  <ContactForm
      :form-data="props.item"
  />
</template>

<script setup lang="ts">
import ContactForm from "@/components/contact_request/ContactForm.vue";
import ContactRequest from "@/models/ContactRequest";

const props = defineProps({
  item: ContactRequest
})

</script>


<style scoped>

</style>