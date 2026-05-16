<template>
  <ModalDialog
    ref="modalRef"
    title="Выбрать или создать клиента"
    description="Найдите клиента по имени, телефону или email, либо создайте нового."
    dynamic-style="sm:max-w-2xl"
  >
    <template #content>
      <ClientPickerForm
        ref="formRef"
        id-prefix="cpm"
        :clients="clients"
        :refresh-clients="refreshClients"
        @select="onSelect"
      />
    </template>
  </ModalDialog>
</template>

<script setup>
import { ref } from "vue";

import ModalDialog from "@/components/dynamics/shadcn/ModalDialog.vue";
import ClientPickerForm from "@/components/orders/modals/ClientPickerForm.vue";

defineProps({
  clients: {
    type: Array,
    default: () => [],
  },
  refreshClients: {
    type: Function,
    default: () => {},
  },
});

const emit = defineEmits(["select"]);

const modalRef = ref(null);
const formRef = ref(null);

const onSelect = (client) => {
  emit("select", client);
  modalRef.value?.close?.();
};

const open = () => {
  modalRef.value?.open?.();
};

const close = () => {
  modalRef.value?.close?.();
  formRef.value?.reset?.();
};

defineExpose({ open, close });
</script>
