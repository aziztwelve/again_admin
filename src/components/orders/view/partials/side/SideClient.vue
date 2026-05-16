<template>
  <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-900">Клиент</h3>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        :disabled="saving"
        @click="openPicker"
      >
        <Pencil class="mr-1 h-3.5 w-3.5" />
        {{ client ? "Изменить" : "Выбрать" }}
      </Button>
    </div>

    <div v-if="!client" class="mt-2 text-sm text-gray-500">Не указан</div>
    <dl v-else class="mt-3 space-y-2 text-sm">
      <div>
        <dt class="text-xs uppercase text-gray-500">ФИО</dt>
        <dd class="text-gray-900">
          <router-link
            v-if="client.id"
            :to="`/clients/${client.id}`"
            class="text-blue-600 hover:underline"
          >
            {{ fullName }}
          </router-link>
          <span v-else>{{ fullName }}</span>
        </dd>
      </div>
      <div>
        <dt class="text-xs uppercase text-gray-500">Телефон</dt>
        <dd class="text-gray-900">{{ phone || "—" }}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase text-gray-500">Email</dt>
        <dd class="text-gray-900">{{ client.email || "—" }}</dd>
      </div>
      <div v-if="stats">
        <dt class="text-xs uppercase text-gray-500">Заказов</dt>
        <dd class="text-gray-900">
          <router-link
            v-if="client?.id"
            :to="`/clients/${client.id}`"
            class="text-blue-600 hover:underline"
          >
            {{ stats.orders_count }}
          </router-link>
          <span v-else>{{ stats.orders_count }}</span>
        </dd>
      </div>
      <div v-if="stats">
        <dt class="text-xs uppercase text-gray-500">Оборот</dt>
        <dd class="text-gray-900">{{ formatPrice(stats.orders_total) }}</dd>
      </div>
    </dl>

    <ClientPickerModal
      ref="pickerRef"
      :clients="clientsList"
      :refresh-clients="refreshClients"
      @select="onSelectClient"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { Pencil } from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";
import ClientPickerModal from "@/components/orders/modals/ClientPickerModal.vue";

const props = defineProps({
  client: { type: Object, default: null },
  stats: { type: Object, default: null },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["save"]);

const store = useStore();
const pickerRef = ref(null);

const clientsList = computed(() => store.getters["clients/clients"] || []);

const fullName = computed(() => {
  if (!props.client) return "—";
  const p = props.client.profile || {};
  return (
    [
      p.last_name ?? props.client.last_name,
      p.first_name ?? props.client.first_name,
      p.middle_name ?? props.client.middle_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    props.client.name ||
    p.full_name ||
    "—"
  );
});

const phone = computed(
  () => props.client?.profile?.phone ?? props.client?.phone ?? null,
);

const refreshClients = () => store.dispatch("clients/getClients");

const openPicker = () => {
  if (!clientsList.value.length) refreshClients();
  pickerRef.value?.open?.();
};

const onSelectClient = (client) => {
  if (!client?.id) return;
  emit("save", { client_id: client.id });
};

const formatPrice = (value) => {
  const n = Number(value || 0);
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
  }).format(n);
};

onMounted(() => {
  if (!clientsList.value.length) refreshClients();
});
</script>
