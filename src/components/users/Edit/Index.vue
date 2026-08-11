<template>
  <div class="grid gap-3">
    <div class="flex justify-end">
      <Button
          type="button"
          variant="outline"
          @click="togglePasswordMode"
      >
        {{ item.changePass ? 'Редактировать данные' : 'Изменить пароль' }}
      </Button>
    </div>

    <form class="grid gap-3" v-show="!item.changePass">
    <div class="flex gap-2">
      <Input type="text" placeholder="Имя" v-model="item.profile.first_name"/>
      <Input type="text" placeholder="Фамилия" v-model="item.profile.last_name"/>
    </div>

    <Input type="email" placeholder="Почта (E-mail)" v-model="item.email"/>
    <Input type="tel" placeholder="Телефон" v-model="item.profile.phone"/>

    <div class="space-y-2">
      <!--      {{roles}}-->
      <Label for="roles">Роли <span class="text-red-500">*</span></Label>
      <DropdownSelect
          id="roles"
          :disabled="!hasPermission(PermissionsData.ROLES_MANAGE, false)"
          v-model="selectedRoleId"
          :options="roles"
          optionLabel="name"
          optionValue="id"
          placeholder="Выберите роли"
      />
    </div>

    <div class="space-y-2">
      <Label for="permissions">Разрешения</Label>
      <MultiSelect
          id="permissions"
          :disabled="!hasPermission(PermissionsData.PERMISSIONS_MANAGE, false)"
          :options="permissions"
          v-model="selectedPermissionIds"
          optionLabel="name"
          optionValue="id"
          placeholder="Выберите разрешения"
      />
    </div>
    </form>

    <ChangePassword
        :change-pass="item.changePass"
        :item="item"
    />
  </div>

</template>

<script setup>
import {Input} from "@/components/ui/input"
import { useUsersFunctions } from "@/composables/useUsersFunctions"
import axios from "axios"
import {onMounted, ref, watch} from "vue"
import MultiSelect from "@/components/dynamics/Dropdown/MultiSelect.vue"
import DropdownSelect from "@/components/dynamics/Dropdown/Select.vue"
import {Label} from "@/components/ui/label"
import {Button} from "@/components/ui/button"
import ChangePassword from "@/components/users/Edit/ChangePassword.vue"
import {PermissionsData} from "@/constants/PermissionsData";
import usePermission from "@/composables/usePermission";

const permissions = ref([])
const roles = ref([])

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const {hasPermission} = usePermission()
const { getRoles, getPermissions } = useUsersFunctions()


const selectedPermissionIds = ref()

const selectedRoleId = ref()


watch(selectedPermissionIds, (ids) => {
  props.item.perms = ids
})


watch(selectedRoleId, (id) => {
  props.item.role = id
})

// Инициализация
if (!props.item.changePass) {
  props.item.changePass = false
}
if (!props.item.roles) {
  props.item.roles = []
}
if (!props.item.permissions) {
  props.item.permissions = []
}

const togglePasswordMode = () => {
  props.item.changePass = !props.item.changePass
  props.item.old_password = ''
  props.item.password = ''
  props.item.confirm_password = ''
}

onMounted(async () => {
  roles.value = (await getRoles()) || []
  permissions.value = (await getPermissions()) || []

  selectedRoleId.value = props.item.roles[0]?.id || ''
  selectedPermissionIds.value = props.item.permissions.map(item => item.id || '')
})


</script>

<style scoped>

</style>
