<template>
  <div>
    <TaskLabelForm
        :form-data="taskLabel"
        @submit-form="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import TaskLabelForm from "@/components/orders/tasks/label/TaskLabelForm.vue";
import { ref } from "vue";
import TaskLabel from "@/models/TaskLabel";
import { useTaskLabelFunctions } from "@/composables/useTaskLabelFunctions";

const emit = defineEmits(["created"]);

const taskLabel = ref(TaskLabel.fromJSON({}));

const { createTaskLabel } = useTaskLabelFunctions();

const handleSubmit = async () => {
  const errors = taskLabel.value.validate();

  if (!errors.length) {
    const result = await createTaskLabel(taskLabel.value.toJSONForCreate());
    if (result) {
      emit("created", result);
    }
  }
};
</script>

<style scoped>
</style>
