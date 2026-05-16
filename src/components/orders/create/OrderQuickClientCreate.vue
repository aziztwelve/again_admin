<template>
  <div
    class="-mx-4 px-4 py-8 ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-6 lg:col-span-1"
  >
    <h3 class="text-sm/6 font-medium text-gray-900">Добавить клиента</h3>
    <p class="mt-1 text-sm text-gray-500">
      Выберите существующего клиента или быстро создайте нового.
    </p>

    <ModalDialog
      v-if="!resolvedSelectedClient"
      ref="modalRef"
      title="Добавить клиента"
      description="Найдите клиента по имени, телефону или email, либо создайте нового."
      dynamic-style="sm:max-w-2xl"
    >
      <template #trigger>
        <Button type="button" variant="outline" class="mt-5 w-full gap-2">
          <Plus class="h-4 w-4" />
          Выбрать или создать клиента
        </Button>
      </template>

      <template #content>
        <ClientPickerForm
          ref="formRef"
          id-prefix="quick"
          :clients="clients"
          :refresh-clients="refreshClients"
          @select="handleSelect"
        />
      </template>
    </ModalDialog>

    <div
      v-if="resolvedSelectedClient"
      class="mt-5 space-y-4 rounded-lg border border-green-200 bg-green-50 p-4"
    >
      <div>
        <p class="text-sm font-medium text-gray-900">
          {{ resolvedSelectedClient.first_name }}
          {{ resolvedSelectedClient.last_name }}
        </p>
        <p class="mt-1 text-sm text-gray-600">
          {{ resolvedSelectedClient.phone || "Телефон не указан" }}
        </p>
        <p class="mt-1 text-sm text-gray-600">
          {{ resolvedSelectedClient.email || "Email не указан" }}
        </p>
      </div>

      <div
        class="rounded-md bg-white px-3 py-2 text-xs text-green-700 ring-1 ring-green-200"
      >
        Клиент выбран для текущего заказа.
      </div>

      <Button
        type="button"
        variant="outline"
        class="w-full"
        @click="resetCreatedClient"
      >
        Выбрать другого клиента
      </Button>
    </div>

    <div
      v-if="
        !resolvedSelectedClient &&
        (props.errors?.client_id ||
          props.errors?.user?.first_name ||
          props.errors?.user?.last_name)
      "
      class="mt-5"
    >
      <p class="text-sm text-red-600">Укажите клиента</p>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from "vue";
import { Plus } from "lucide-vue-next";

import ModalDialog from "@/components/dynamics/shadcn/ModalDialog.vue";
import Button from "@/components/ui/button/Button.vue";
import ClientPickerForm from "@/components/orders/modals/ClientPickerForm.vue";

const props = defineProps({
  clients: {
    type: Array,
    default: () => [],
  },
  selectedClient: {
    type: Object,
    default: null,
  },
  refreshClients: {
    type: Function,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["created", "cleared"]);

const modalRef = ref(null);
const formRef = ref(null);
const createdClient = ref(null);

const normalizeClient = (client) => {
  const firstName = client?.first_name ?? client?.profile?.first_name ?? "";
  const lastName = client?.last_name ?? client?.profile?.last_name ?? "";
  const fullName =
    client?.full_name ??
    client?.profile?.full_name ??
    client?.name ??
    `${firstName} ${lastName}`.trim();

  return {
    id: client?.id ?? null,
    first_name: firstName,
    last_name: lastName,
    name: client?.name ?? "",
    full_name: fullName,
    phone: client?.phone ?? client?.profile?.phone ?? client?.user?.phone ?? "",
    email: client?.email ?? "",
  };
};

const resolvedSelectedClient = computed(() => {
  if (createdClient.value) {
    return normalizeClient(createdClient.value);
  }

  if (props.selectedClient) {
    return normalizeClient(props.selectedClient);
  }

  return null;
});

const handleSelect = (client) => {
  createdClient.value = client;
  emit("created", client);
  modalRef.value?.close?.();
};

const resetCreatedClient = () => {
  createdClient.value = null;
  formRef.value?.reset?.();
  emit("cleared");
  nextTick(() => {
    modalRef.value?.open?.();
  });
};
</script>
