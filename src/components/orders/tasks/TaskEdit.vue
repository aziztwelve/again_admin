<template>
  <TaskForm
      :form-data="item"
      :is-edit="true"
      :show-submit-button="false"
  />
</template>

<script setup lang="ts">
import {ref, watch, PropType} from 'vue'
import Task from "@/models/Task";
import TaskForm from "@/components/orders/tasks/TaskForm.vue";

const props = defineProps({
  item: {
    type: Object as PropType<Task>,
    required: true,
  },
})


</script>


<style scoped>

</style>