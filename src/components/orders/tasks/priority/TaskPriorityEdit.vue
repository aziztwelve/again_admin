<template>
  <TaskPriorityForm
      :form-data="props.item"
      :show-submit-button="false"
  />
</template>

<script setup lang="ts">
import TaskPriorityForm from "@/components/orders/tasks/priority/TaskPriorityForm.vue";
import TaskPriority from "@/models/TaskPriority";

const props = defineProps({
  item: {
    type: TaskPriority,
    required: true,
  },
})

</script>

<style scoped>

</style>