<template>
  <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <div>
        <Label for="order-status" class="text-xs uppercase text-gray-500">
          Статус заказа
        </Label>
        <Select
          id="order-status"
          v-model="localStatus"
          :options="orderStatusOptions"
          option-label="label"
          option-value="value"
          :disabled="savingField === 'status'"
          placeholder="Выберите статус"
          @update:modelValue="onChange('status', $event)"
        />
      </div>

      <div>
        <Label for="payment-status" class="text-xs uppercase text-gray-500">
          Статус оплаты
        </Label>
        <Select
          id="payment-status"
          v-model="localPaymentStatus"
          :options="paymentStatusOptions"
          option-label="label"
          option-value="value"
          :disabled="savingField === 'payment_status'"
          placeholder="—"
          @update:modelValue="onChange('payment_status', $event)"
        />
      </div>

      <div>
        <Label for="payment-method" class="text-xs uppercase text-gray-500">
          Способ оплаты
        </Label>
        <Select
          id="payment-method"
          v-model="localPaymentMethod"
          :options="paymentMethodOptions"
          option-label="label"
          option-value="value"
          :disabled="savingField === 'payment_method'"
          placeholder="—"
          @update:modelValue="onChange('payment_method', $event || null)"
        />
      </div>

      <div>
        <Label for="order-paid-at" class="text-xs uppercase text-gray-500">
          Дата оплаты
        </Label>
        <Input
          id="order-paid-at"
          v-model="localPaidAt"
          type="datetime-local"
          class="mt-1 h-9 text-sm"
          :disabled="savingField === 'paid_at'"
          @change="onPaidAtChange"
        />
        <div v-if="order.payment_id" class="text-xs text-gray-500">
          ID транзакции: {{ order.payment_id }}
        </div>
      </div>

      <div>
        <Label for="order-manager" class="text-xs uppercase text-gray-500">
          Менеджер
        </Label>
        <Select
          id="order-manager"
          v-model="localAssignedUserId"
          :options="managerOptions"
          option-label="label"
          option-value="value"
          :disabled="savingField === 'assigned_user_id' || managersLoading"
          :placeholder="managersLoading ? 'Загрузка...' : 'Не назначен'"
          searchable
          search-placeholder="Поиск менеджера..."
          @update:modelValue="onManagerChange"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Select from "@/components/dynamics/Dropdown/Select.vue";
import { useStatusFunctions } from "@/composables/useStatusFunctions";
import { useOrderPaymentMethods } from "@/composables/orders/useOrderPaymentMethods";

const props = defineProps({
  order: { type: Object, required: true },
});

const emit = defineEmits(["update"]);

const { getStatuses, getAllStatuses } = useStatusFunctions();
const { paymentMethodOptions, fetchPaymentMethods } = useOrderPaymentMethods();

const savingField = ref(null);

// Slug роли «Менеджер» в разделе «Роли» (см. UserController::index?role=...)
const MANAGER_ROLE_SLUG = "manager";

const extractValue = (val) => {
  if (val == null) return null;
  if (typeof val === "object") return val.value ?? val.code ?? null;
  return val;
};

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const localStatus = ref(extractValue(props.order?.status));
const localPaymentStatus = ref(
  extractValue(props.order?.payment_status) || "pending",
);
const localPaymentMethod = ref(props.order?.payment_method ?? "");
const localAssignedUserId = ref(
  props.order?.assigned_user_id != null
    ? String(props.order.assigned_user_id)
    : "",
);
const localPaidAt = ref(toDateTimeLocal(props.order?.paid_at));

watch(
  () => props.order,
  (newOrder) => {
    localStatus.value = extractValue(newOrder?.status);
    localPaymentStatus.value =
      extractValue(newOrder?.payment_status) || "pending";
    localPaymentMethod.value = newOrder?.payment_method ?? "";
    localAssignedUserId.value =
      newOrder?.assigned_user_id != null
        ? String(newOrder.assigned_user_id)
        : "";
    localPaidAt.value = toDateTimeLocal(newOrder?.paid_at);
  },
  { deep: true },
);

const orderStatusOptions = computed(() => {
  const list = getStatuses("order");
  return Array.isArray(list) && list.length
    ? list
    : [{ value: "new", label: "Новый" }];
});

const paymentStatusOptions = [
  { value: "pending", label: "Ожидание" },
  { value: "paid", label: "Оплачено" },
];

// === Менеджеры (пользователи с ролью «Менеджер» из раздела «Роли») ===

const managers = ref([]);
const managersLoading = ref(false);

const userDisplayName = (user) => {
  if (!user) return "";
  const profile = user.profile || {};
  const fullName =
    user.full_name ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  return fullName || user.email || `#${user.id}`;
};

const fetchManagers = async () => {
  if (managersLoading.value) return;
  managersLoading.value = true;
  try {
    const { data } = await axios.get("/users", {
      params: { role: MANAGER_ROLE_SLUG, per_page: 100 },
    });
    managers.value = data?.users?.data || [];
  } catch (e) {
    console.error("Failed to load managers", e);
    managers.value = [];
  } finally {
    managersLoading.value = false;
  }
};

const managerOptions = computed(() => {
  const options = (managers.value || []).map((u) => ({
    value: String(u.id),
    label: userDisplayName(u),
  }));

  // Если у заказа уже выбран менеджер, но его нет в загруженном списке
  // (потенциально лишился роли «Менеджер»), добавим его, чтобы Select мог
  // отобразить выбранное значение.
  const currentId = localAssignedUserId.value;
  if (currentId && !options.some((opt) => opt.value === currentId)) {
    const current = props.order?.assigned_user;
    options.unshift({
      value: currentId,
      label: current ? userDisplayName(current) : `Пользователь #${currentId}`,
    });
  }

  return options;
});

// Подгружаем статусы, если ещё не закэшированы
getAllStatuses();
onMounted(() => {
  fetchManagers();
  fetchPaymentMethods();
});

const onChange = async (field, value) => {
  savingField.value = field;
  try {
    await emit("update", { [field]: value });
  } finally {
    savingField.value = null;
  }
};

const onManagerChange = async (value) => {
  // value === '' приходит при клике по крестику (clearSelection в Select.vue).
  // На бэке трактуется как «открепить менеджера».
  const payload = value === "" || value == null ? null : Number(value);
  await onChange("assigned_user_id", payload);
};

const onPaidAtChange = async () => {
  // datetime-local => 'YYYY-MM-DDTHH:mm' либо '' если очищено.
  // На бэке '' трактуется как null (сбросить дату оплаты).
  const value = localPaidAt.value || null;
  await onChange("paid_at", value);
};

</script>
