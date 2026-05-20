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

    <!--
      Если client не привязан — это либо «гостевой заказ», либо ещё не подтверждён.
      Показываем контакты, сохранённые в самом заказе (и в order_addresses), плюс
      пометку, что аккаунта в clients нет — менеджер может или связаться по
      имеющимся данным, или нажать «Выбрать» и привязать существующего клиента.
    -->
    <div v-if="!client" class="mt-2 space-y-2 text-sm">
      <div class="text-amber-700 text-xs uppercase">Гостевой заказ</div>
      <dl class="space-y-2">
        <div v-if="guestName">
          <dt class="text-xs uppercase text-gray-500">ФИО</dt>
          <dd class="text-gray-900">{{ guestName }}</dd>
        </div>
        <div v-if="guestPhone">
          <dt class="text-xs uppercase text-gray-500">Телефон</dt>
          <dd class="text-gray-900">{{ guestPhone }}</dd>
        </div>
        <div v-if="guestEmail">
          <dt class="text-xs uppercase text-gray-500">Email</dt>
          <dd class="text-gray-900">{{ guestEmail }}</dd>
        </div>
        <div v-if="!guestName && !guestPhone && !guestEmail" class="text-gray-500">
          Контактные данные не указаны
        </div>
      </dl>
    </div>
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
  // Сам заказ нужен, чтобы для гостевого случая (client === null) показать
  // контактные данные, сохранённые в orders + order_addresses.recipient_*.
  order: { type: Object, default: null },
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

// ===== Гостевой заказ: контактные данные из самого order =====
// Эти значения хранятся в orders (first_name/last_name/phone/email) — если
// колонки есть, и/или в order_addresses.recipient_* через relation address.
const guestName = computed(() => {
  const o = props.order || {};
  const addr = o.address || {};
  const parts = [
    addr.recipient_last_name ?? o.last_name,
    addr.recipient_first_name ?? o.first_name,
    addr.recipient_middle_name,
  ].filter(Boolean);
  return parts.join(" ").trim() || null;
});

const guestPhone = computed(() => {
  const o = props.order || {};
  return o.address?.recipient_phone ?? o.phone ?? null;
});

const guestEmail = computed(() => {
  return props.order?.email ?? null;
});

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
