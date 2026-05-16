<template>
  <Loader v-if="loading"/>
  <DynamicForm
      v-else
      v-model="props.formData"
      :key="renderForm"
      :fields="formFields"
      :errors="errors"
      :show-submit-button="showSubmitButton"
      :submit-button-text="submitButtonName"
      @submit-form="emit('submitForm')"
  />
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import DynamicForm from '@/components/dynamics/DynamicForm.vue'
import Task from "@/models/Task";
import {FormDynamicFieldType} from "@/types/form";
import Loader from "@/components/common/Loader.vue";
import {useTaskFunctions} from "@/composables/useTaskFunctions";
import TaskStatus from "@/models/TaskStatus";
import TaskPriority from "@/models/TaskPriority";
import TaskLabel from "@/models/TaskLabel";
import {User} from "@/models/user/User";

const props = defineProps({
  formData: {
    type: Task,
    required: true,
  },
  submitButtonName: {
    type: String,
    default: 'Создать'
  },
  showSubmitButton: {
    type: Boolean,
    default: true
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['submitForm'])

const loading = ref<boolean>(true);

const renderForm = ref(1)
const formFields = ref<any[]>([])

const {getTasks} = useTaskFunctions()

// Данные для селектов
const taskStatuses = ref<TaskStatus[]>([])
const taskPriorities = ref<TaskPriority[]>([])
const taskLabels = ref<TaskLabel[]>([])
const users = ref<User[]>([])
const parentTasks = ref<Task[]>([])

onMounted(async () => {
  await loadSelectData()
  await buildFormFields()
  loading.value = false
})

const loadSelectData = async () => {

  const response = await getTasks({per_page: 1})

  if (response) {
    taskStatuses.value = response.statuses

    taskPriorities.value = response.priorities

    taskLabels.value = response.labels

    users.value = response.users

    const allTasksResponse = response.tasks
    if (allTasksResponse) {
      parentTasks.value = allTasksResponse
          ?.filter(task => props.isEdit ? task.id !== props.formData.id : true)
    }
  }
}

const buildFormFields = async () => {
  formFields.value = [
    [
      {
        name: 'title',
        label: 'Название задачи',
        component: 'text',
        type: 'text',
        placeholder: 'Введите название задачи',
        required: true,
      },
    ],

    [
      {
        name: 'description',
        label: 'Описание',
        component: 'textarea',
        placeholder: 'Описание задачи',
        rows: 4,
      },
    ],

    [
      {
        name: 'status_id',
        label: 'Статус',
        component: 'select',
        placeholder: 'Выберите статус',
        options: taskStatuses.value,
        optionValue: 'id',
        optionLabel: 'name',
        required: true,
      },
      {
        name: 'priority_id',
        label: 'Приоритет',
        component: 'select',
        placeholder: 'Выберите приоритет',
        options: taskPriorities.value,
        optionValue: 'id',
        optionLabel: 'name',
        required: true,
      },
    ],


    [

      {
        name: 'started_at',
        label: 'Дата начала',
        component: 'date',
        type: 'datetime-local',
        placeholder: 'Выберите дату',
      },

      {
        name: 'due_date',
        label: 'Срок выполнения',
        component: 'date',
        type: 'datetime-local',
        placeholder: 'Выберите дату',
      },
    ],

    [

      {
        name: 'estimated_time',
        label: 'Планируемое время (минуты)',
        component: 'text',
        type: 'number',
        placeholder: 'Ожидаемое время выполнения в минутах',
      },

      {
        name: 'assignee_id',
        label: 'Исполнитель',
        component: 'select',
        placeholder: 'Выберите исполнителя',
        options: users.value,
        optionValue: 'id',
        optionLabel: 'name',
      },

      // {
      //   name: 'parent_id',
      //   label: 'Родительская задача',
      //   component: 'select',
      //   placeholder: 'Выберите родительскую задачу',
      //   options: parentTasks.value,
      //   optionValue: 'id',
      //   optionLabel: 'name',
      //   description: 'Сделать эту задачу подзадачей другой задачи',
      // },


    ],


    [
      {
        name: 'label_ids',
        label: 'Метки',
        component: 'multiSelect',
        placeholder: 'Выберите метки',
        options: taskLabels.value,
        optionValue: 'id',
        optionLabel: 'name',
        description: 'Можно выбрать несколько меток',
      },

      // Дополнительные поля для редактирования
      ...(props.isEdit ? [

        {
          name: 'spent_time',
          label: 'Потрачено времени (минуты)',
          component: 'text',
          type: 'number',
          placeholder: '0',
          description: 'Фактически потраченное время в минутах',
        },


        // {
        //   name: 'completed_at',
        //   label: 'Дата завершения',
        //   component: 'date',
        //   type: 'datetime-local',
        //   placeholder: 'Выберите дату завершения',
        // },

      ] : []),

    ],


  ]
}
</script>