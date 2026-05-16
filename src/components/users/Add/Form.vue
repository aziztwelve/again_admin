<template>
  <form @submit.prevent="submitForm(form)" class="grid gap-4">
    <!-- Основные поля формы -->
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-2">
        <Label for="first_name">Имя <span class="text-red-500">*</span></Label>
        <Input id="first_name" v-model="form.first_name" placeholder="Введите имя"/>
        <p v-if="errors.first_name" class="text-sm text-red-500">{{ errors.first_name }}</p>
      </div>
      <div class="space-y-2">
        <Label for="last_name">Фамилия <span class="text-red-500">*</span></Label>
        <Input id="last_name" v-model="form.last_name" placeholder="Введите фамилию"/>
        <p v-if="errors.last_name" class="text-sm text-red-500">{{ errors.last_name }}</p>
      </div>
    </div>


    <!-- Остальные поля -->
    <div class="space-y-2">
      <Label for="email">Почта <span class="text-red-500">*</span></Label>
      <Input id="email" type="email" v-model="form.email" placeholder="example@mail.com"/>
      <p v-if="errors.email" class="text-sm text-red-500">{{ errors.email }}</p>
    </div>

    <div class="space-y-2">
      <Label for="phone">Телефон <span class="text-red-500">*</span></Label>
      <Input type="text" placeholder="Телефон" v-model="form.phone"/>
    </div>

    <!-- Поля для пароля -->
    <div class="space-y-2">
      <Label for="password">Пароль <span class="text-red-500">*</span></Label>
      <Input id="password" type="password" v-model="form.password" placeholder="Не менее 8 символов"/>
      <p v-if="errors.password" class="text-sm text-red-500">{{ errors.password }}</p>
    </div>

    <div class="space-y-2">
      <Label for="password_confirmation">Подтверждение пароля <span class="text-red-500">*</span></Label>
      <Input
          id="password_confirmation"
          type="password"
          v-model="form.password_confirmation"
          placeholder="Повторите пароль"
      />
    </div>

    <!-- Выбор ролей -->
    <div class="space-y-2">
      <Label for="roles">Роли <span class="text-red-500">*</span></Label>
<!--      {{hasPermission(PermissionsData.ROLES_MANAGE)}}-->
      <DynamicsDropdownSelect
          id="roles"
          :disabled="!hasPermission(PermissionsData.ROLES_MANAGE, false)"
          :options="props.roles"
          optionLabel="name"
          optionValue="id"
          v-model="form.roles"
          placeholder="Выберите роли"
      />
      <p v-if="errors.roles" class="text-sm text-red-500">{{ errors.roles }}</p>
    </div>

    <!-- Выбор разрешений -->
    <div class="space-y-2">
      <Label for="permissions">Разрешения</Label>
      <MultiSelect
          id="permissions"
          :disabled="!hasPermission(PermissionsData.PERMISSIONS_MANAGE, false)"
          :options="props.permissions"
          v-model="form.permissions"
          optionLabel="name"
          optionValue="id"
          placeholder="Выберите разрешения"
      />
      <p v-if="errors.permissions" class="text-sm text-red-500">{{ errors.permissions }}</p>
    </div>

    <!-- Кнопка отправки -->
    <Button type="submit" class="mt-2" :disabled="loading">
      <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin"/>
      {{ loading ? 'Создание...' : 'Создать пользователя' }}
    </Button>
  </form>
</template>

<script setup>
import {ref} from 'vue'
import {toast} from 'vue-sonner'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Loader2} from 'lucide-vue-next'
import {useUserFunctions} from "@/composables/userFunctions";
import MultiSelect from "@/components/common/MultiSelect.vue";
import DynamicsDropdownSelect from "@/components/dynamics/Dropdown/Select.vue";
import usePermission from "@/composables/usePermission";
import {PermissionsData} from "@/constants/PermissionsData";

const props = defineProps({
  roles: {
    type: Array,
    default: () => [],
    required: true
  },
  permissions: {
    type: Array,
    default: () => [],
    required: true
  }
})


const {hasPermission} = usePermission()

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  roles: [],
  permissions: []
})

const errors = ref({})
const loading = ref(false)

const emit = defineEmits(['submit'])

const submitForm = async form => {
  if (
      form.first_name &&
      form.last_name &&
      form.email &&
      form.phone &&
      form.password &&
      form.password_confirmation

  ) {

    if (form.password !== form.password_confirmation) {
      return toast.error("Пароли не совпадают!");
    }

    if (form.password.length < 8) {
      return toast.error("Пароль должен быть не менее 8 символов!");
    }

    const result = await useUserFunctions().addUser({...form, roles: [form.roles]}, loading)
    if (result) {
      emit("submit");
    }
  } else {
    toast.error("Заполните все данные для создания пользователя");
  }
};

</script>