<template>
  <div>
    <TaskForm
        :form-data="task"
        :errors="fieldErrors"
        @submit-form="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import TaskForm from "@/components/orders/tasks/TaskForm.vue";
import axios from "axios";
import {ref} from "vue";
import Task from "@/models/Task";
import {useSuccessHandler} from "@/composables/useSuccessHandler";
import {useErrorHandler} from "@/composables/useErrorHandler";

const props = defineProps<{
  orderId?: number | string | null;
}>();

const emit = defineEmits(['created'])
const task = ref(Task.fromJSON({}))
if (props.orderId) {
  task.value.order_id = Number(props.orderId);
}

// Ошибки валидации полей от бэкенда (422). Ключи — имена полей,
// значения — первое сообщение для каждого поля (DynamicForm рендерит строку).
const fieldErrors = ref<Record<string, string>>({});

const handleSubmit = async () => {
  fieldErrors.value = {};
  try {
    const res = await axios.post('tasks', task.value.toJSONForCreate());
    useSuccessHandler().showSuccess(res);
    emit('created', Task.fromJSON(res.data?.task || res.data));
  } catch (e: any) {
    const errors = e?.response?.data?.errors;
    if (e?.response?.status === 422 && errors && typeof errors === 'object') {
      const flat: Record<string, string> = {};
      for (const k of Object.keys(errors)) {
        const v = errors[k];
        flat[k] = Array.isArray(v) ? v[0] : String(v);
      }
      fieldErrors.value = flat;
    }
    useErrorHandler().showError(e);
  }
}

</script>

<style scoped>

</style>