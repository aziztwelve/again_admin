<template>
  <div>
    <ClientFormModal
        ref="clientFormModal"
        :form-data="formData"
        :button-name="buttonName"
        :button-icon="!buttonName ? 'pencil' : undefined"
        submit-button-text="Сохранить"
        @submit-form="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import ClientFormModal from "@/components/clients/Modal/ClientFormModal.vue";
import {Client, ClientFormData, clientToFormData} from "@/types/client";
import {ref} from "vue";
import {useClientFunctions} from "@/composables/useClientFunctions";

interface Props {
  client: Client;
  buttonName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'updated', client: Client): void
}>()

const formData = ref<ClientFormData>(clientToFormData(props.client));
const {editClientCorrect} = useClientFunctions()

const clientFormModal = ref<{
  closeModal: () => void
} | null>(null);

const handleSubmit = () => {
  editClientCorrect(props.client.id, formData.value)
      .then(res => {
        emit('updated', res)
        clientFormModal.value?.closeModal()
      })
      .catch(e => {
        console.error(e)
      })
}

</script>

<style scoped>

</style>