<template>
  <div class="flex">
    <Button
        variant="outline"
        size="icon"
        class="w-auto px-3"
        @click="dialogOpen = true"
    >
      <Pencil class="h-4 w-4 mr-2"/>
      Редактировать профиль
    </Button>

    <DynamicsModal
        :dialog-open="dialogOpen"
        @close="dialogOpen = false"
        title="Редактирование профиля"
        description="Обновите информацию о себе"
    >
      <template v-slot:content>
        <ProfileEditForm
            :user="user"
            @submit="handleSubmit"
        />
      </template>
    </DynamicsModal>
  </div>
</template>


<script setup lang="ts">
import {onMounted, ref} from "vue"
import {Button} from "@/components/ui/button";
import DynamicsModal from "@/components/dynamics/Modal.vue";
import ProfileEditForm from "@/components/profile/Edit/Form.vue";
import {Pencil} from "lucide-vue-next";
import {useUserFunctions} from "@/composables/userFunctions";
import {User} from "@/models/user/User";

const props = defineProps({
  user: {
    type: Object as () => User | null,
    default: null
  }
})

const emit = defineEmits(['updated'])
const dialogOpen = ref(false);

const {updateUserProfile} = useUserFunctions()

async function handleSubmit() {
  try {
    const res = await updateUserProfile({
      email: props.user?.email,
      ...props.user?.profile
    });

    if (res) {
      dialogOpen.value = false;
      emit('updated', res);
    }
  } catch (error) {
    console.error("Error adding client:", error);
  }
}
</script>

<style scoped></style>