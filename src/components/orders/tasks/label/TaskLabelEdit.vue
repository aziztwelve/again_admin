<template>
  <TaskLabelForm
      :form-data="props.item"
      :show-submit-button="false"
  />
</template>

<script setup lang="ts">
import TaskLabelForm from "@/components/orders/tasks/label/TaskLabelForm.vue";
import TaskLabel from "@/models/TaskLabel";

const props = defineProps({
  item: {
    type: TaskLabel,
    required: true,
  },
})

</script>

<style scoped>

</style>