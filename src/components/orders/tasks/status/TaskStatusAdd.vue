<template>
  <div>
    <TaskStatusForm
        :form-data="taskStatus"
        @submit-form="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import TaskStatusForm from "@/components/orders/tasks/status/TaskStatusForm.vue";
import {ref} from "vue";
import TaskStatus from "@/models/TaskStatus";
import {useTaskStatusFunctions} from "@/composables/useTaskStatusFunctions";

const emit = defineEmits(["created"]);

const taskStatus = ref(TaskStatus.fromJSON({}))


const {createTaskStatus} = useTaskStatusFunctions()

const handleSubmit = async () => {

  const taskError = taskStatus.value.validate()

  if (!taskError.length) {
    const result = await createTaskStatus(taskStatus.value.toJSONForCreate())
    if (result) {
      emit("created", result)
    }
  }

}

</script>

<style scoped>

</style>