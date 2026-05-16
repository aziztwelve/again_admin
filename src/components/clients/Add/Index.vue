<template>
  <div class="flex">
    <Button
        variant="outline"
        size="icon"
        class="w-auto px-3"
        @click="dialogOpen = true"
    >
      <CirclePlus class="w-4 h-4 mr-2"/>
      Добавить
    </Button>

    <DynamicsModal
        :dialog-open="dialogOpen"
        @close="dialogOpen = false"
        title="Добавить нового клиента"
        description="Заполните информацию о новом клиенте"
    >
      <template v-slot:content>
        <ClientsAddForm
            @submit="handleSubmit"
            @cancel="dialogOpen = false"
        />
      </template>
    </DynamicsModal>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue"
import {Button} from "@/components/ui/button";
import DynamicsModal from "@/components/dynamics/Modal.vue";
import ClientsAddForm from "@/components/clients/Add/Form.vue";
import {CirclePlus} from "lucide-vue-next";
import {useClientFunctions} from "@/composables/useClientFunctions";

const emit = defineEmits(['submit'])
const dialogOpen = ref(false);

async function handleSubmit() {
  dialogOpen.value = false;
  emit('submit');
}
</script>

<style scoped></style>