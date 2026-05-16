<template>
  <div>
    <TaskPriorityForm
        :form-data="taskPriority"
        @submit-form="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import TaskPriorityForm from "@/components/orders/tasks/priority/TaskPriorityForm.vue";
import {ref} from "vue";
import TaskPriority from "@/models/TaskPriority";
import {useTaskPriorityFunctions} from "@/composables/useTaskPriorityFunctions";

const emit = defineEmits(["created"]);

const taskPriority = ref(TaskPriority.fromJSON({}));

const {createTaskPriority} = useTaskPriorityFunctions();

const handleSubmit = async () => {
  const errors = taskPriority.value.validate();

  if (!errors.length) {
    const result = await createTaskPriority(taskPriority.value.toJSONForCreate());
    if (result) {
      emit("created", result);
    }
  }
};
</script>

<style scoped>
</style>
