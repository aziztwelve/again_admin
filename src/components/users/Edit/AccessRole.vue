<template>
  <Select v-if="accessRoles.length" v-model="item.access_role_id">
    <SelectTrigger>
      <SelectValue placeholder="Выберите роль пользователя" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>
          {{ getUserAccessRole(accessRoles, item.access_role_id) }}
        </SelectLabel>
        <SelectItem
          v-for="(access_role, key) in accessRoles"
          :key="key"
          :value="access_role.id"
        >
          {{ access_role.access }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

<script setup>
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const props = defineProps({
  item: Object,
});
const accessRoles = computed(() => useUsersStore().accessRoles);

const getUserAccessRole = (accessRoles, access_role_id) => {
  if (!access_role_id || !accessRoles.length) return;
  const accessRole = accessRoles.find((item) => item.id == access_role_id);

  return accessRole.access;
};

useUsersStore().getAccessRoles();
</script>

<style scoped></style>
