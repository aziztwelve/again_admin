<template>
  <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-900">
        Задачи
        <span v-if="visibleTasks.length" class="ml-1 text-xs font-normal text-gray-500">
          {{ visibleTasks.length }}
        </span>
      </h3>

      <TaskAddModal
          v-if="orderId"
          :order-id="orderId"
          trigger-label="+ Задача"
          trigger-class="h-7 px-2 text-xs"
          title="Новая задача по заказу"
          @created="onCreated"
      />
    </div>

    <ul v-if="visibleTasks.length" class="mt-3 space-y-2">
      <li
          v-for="task in visibleTasks"
          :key="task.id"
          class="rounded-md border border-gray-200 px-3 py-2"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <p
                class="truncate text-sm font-medium"
                :class="task.completed_at ? 'text-gray-400 line-through' : 'text-gray-900'"
            >
              {{ task.title }}
            </p>

            <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span
                  v-if="task.status?.name"
                  class="inline-flex items-center rounded-full px-2 py-0.5 font-medium"
                  :style="badgeStyle(task.status.color)"
              >
                {{ task.status.name }}
              </span>

              <span
                  v-if="task.priority?.name"
                  class="inline-flex items-center rounded-full px-2 py-0.5 font-medium"
                  :style="badgeStyle(task.priority.color)"
              >
                {{ task.priority.name }}
              </span>

              <span
                  v-if="task.due_date"
                  class="text-xs"
                  :class="task.is_overdue ? 'text-red-600 font-medium' : 'text-gray-500'"
              >
                до {{ formatDate(task.due_date) }}
              </span>
            </div>

            <p v-if="task.assignee?.name" class="mt-1 truncate text-xs text-gray-500">
              {{ task.assignee.name }}
            </p>
          </div>

          <div class="flex shrink-0 items-center gap-1">
            <button
                v-if="!task.completed_at"
                type="button"
                class="rounded p-1 text-emerald-600 hover:bg-emerald-50"
                title="Завершить"
                :disabled="busyId === task.id"
                @click="handleComplete(task)"
            >
              <Check class="h-4 w-4" />
            </button>
            <button
                type="button"
                class="rounded p-1 text-red-500 hover:bg-red-50"
                title="Удалить"
                :disabled="busyId === task.id"
                @click="handleDelete(task)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </li>
    </ul>

    <p v-else class="mt-3 text-sm text-gray-500">
      <template v-if="orderId">Нет задач по этому заказу.</template>
      <template v-else>Задачи доступны после сохранения заказа.</template>
    </p>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { Check, Trash2 } from "lucide-vue-next";
import TaskAddModal from "@/components/orders/tasks/TaskAddModal.vue";
import { useTaskFunctions } from "@/composables/useTaskFunctions";

const props = defineProps({
  orderId: { type: [Number, String], default: null },
  tasks: { type: Array, default: () => [] },
});

const emit = defineEmits(["refresh"]);

const { completeTask, deleteTask } = useTaskFunctions();
const busyId = ref(null);

const visibleTasks = computed(() => props.tasks ?? []);

const formatDate = (s) => {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ru-RU");
};

const badgeStyle = (color) => {
  if (!color) return "background-color: #f3f4f6; color: #374151;";
  // Цветной чип с прозрачным фоном.
  return `background-color: ${color}1a; color: ${color}; border: 1px solid ${color}33;`;
};

const onCreated = () => {
  emit("refresh");
};

const handleComplete = async (task) => {
  busyId.value = task.id;
  try {
    await completeTask(task.id);
    emit("refresh");
  } finally {
    busyId.value = null;
  }
};

const handleDelete = async (task) => {
  if (!window.confirm(`Удалить задачу «${task.title}»?`)) return;
  busyId.value = task.id;
  try {
    await deleteTask(task.id);
    emit("refresh");
  } finally {
    busyId.value = null;
  }
};
</script>
