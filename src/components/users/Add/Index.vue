<template>
  <div class="flex justify-end">
    <Button
        variant="outline"
        size="icon"
        class="w-auto px-3 max-md:w-full"
        @click="hasPermission(PermissionsData.USERS_CREATE) ? dialogOpen = true : null"
    >
      <CirclePlus class="w-4 h-4 mr-2"/>
      Добавить
    </Button>

    <DynamicsModal
        :dialog-open="dialogOpen"
        @close="dialogOpen = false"
        title="Добавить нового пользователя"
    >
      <template v-slot:content>
        <UsersAddForm
            :permissions="permissions"
            :roles="roles"
            @submit="handleSubmit"
        />
      </template>
    </DynamicsModal>
  </div>
</template>

<script setup>
import {ref} from "vue"
import {Button} from "@/components/ui/button";
import DynamicsModal from "@/components/dynamics/Modal.vue";
import UsersAddForm from "@/components/users/Add/Form.vue";
import {CirclePlus} from "lucide-vue-next";
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

const { hasPermission } = usePermission()

const emit = defineEmits(['submit'])
const dialogOpen = ref(false);


function handleSubmit() {
  dialogOpen.value = false
  emit('submit')

}

</script>

<style scoped></style>
