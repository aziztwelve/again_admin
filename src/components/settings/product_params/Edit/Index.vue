<template>
  <ClientsEditForm
      :client-id="item.id"
      :client-data="item"
  />
</template>

<script setup lang="ts">
import ClientsEditForm from "@/components/clients/Edit/Form.vue";
import {Client} from "@/models/client/Client";

const props = defineProps({
  item: {
    type: Object as () => Client,
    required: true
  }
})


</script>

<style scoped></style>