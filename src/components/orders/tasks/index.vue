<template>
  <div class="w-full pb-4">
    <DynamicTabs :tabs="tabs" v-model="tab" class="w-full">

      <template #task>
        <div class="pt-2">
          <TaskList/>
        </div>
      </template>

      <template #status>
        <div class="pt-2">
          <TaskStatusesList/>
        </div>
      </template>

      <template #priorities>
        <div class="pt-2">
          <TaskPriorityList/>
        </div>
      </template>

      <template #labels>
        <div class="pt-2">
          <TaskLabelList/>
        </div>
      </template>

    </DynamicTabs>
  </div>
</template>

<script setup lang="ts">
import DynamicTabs from "@/components/dynamics/shadcn/DynamicTabs.vue";
import {ref} from "vue";
import TaskList from "@/components/orders/tasks/list/TaskList.vue";
import TaskStatusesList from "@/components/orders/tasks/status/list/TaskStatusList.vue";
import TaskPriorityList from "@/components/orders/tasks/priority/list/TaskPriorityList.vue";
import TaskLabelList from "@/components/orders/tasks/label/list/TaskLabelList.vue";

const tab = ref('task');

const tabs = ref([
  {title: 'Задачи', tab: 'task'},
  {title: 'Статусы', tab: 'status'},
  {title: 'Приоритеты', tab: 'priorities'},
  {title: 'Метки', tab: 'labels'},
]);
</script>

<style scoped>
/* Добавь свои стили при необходимости */
</style>
