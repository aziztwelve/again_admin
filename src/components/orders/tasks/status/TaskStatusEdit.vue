<template>
  <TaskStatusForm
      :form-data="props.item"
      :show-submit-button="false"
      :is-edit="false"
  />
</template>

<script setup lang="ts">
import TaskStatus from "@/models/TaskStatus";
import TaskStatusForm from "@/components/orders/tasks/status/TaskStatusForm.vue";

const props = defineProps({
  item: {
    type: TaskStatus,
    required: true,
  },
})

</script>

<style scoped>

</style>