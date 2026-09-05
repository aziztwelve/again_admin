<template>
  <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <!-- ряд 1 -->
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
          :clearable="false"
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
          :clearable="false"
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
          placeholder="Не выбран"
          :clearable="false"
          @update:modelValue="onChange('payment_method', $event || null)"
        />
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
          :clearable="false"
          @update:modelValue="onManagerChange"
        />
      </div>

      <!-- ряд 2 -->
      <div class="col-span-2 lg:col-span-2">
        <Label for="order-paid-at" class="text-xs uppercase text-gray-500">
          Дата оплаты
        </Label>
        <input
          id="order-paid-at"
          v-model="localPaidAt"
          type="datetime-local"
          class="paid-at-input mt-1 block h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="savingField === 'paid_at'"
          @change="onPaidAtChange"
        />
        <div v-if="order.payment_id" class="mt-0.5 text-xs text-gray-500">
          ID транзакции: {{ order.payment_id }}
        </div>
      </div>

      <!-- Возврат оплаты: клиент отказался от покупки после оплаты -->
      <div v-if="canRefundPayment" class="col-span-2">
        <Label class="block text-xs uppercase text-gray-500">
          Возврат оплаты
        </Label>
        <Button
          class="mt-1"
          type="button"
          variant="destructive"
          :disabled="refunding"
          @click="onRefundPayment"
        >
          {{ refunding ? "Возврат оплаты..." : "Отменить оплату" }}
        </Button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Select from "@/components/dynamics/Dropdown/Select.vue";
import { useStatusFunctions } from "@/composables/useStatusFunctions";
import { useOrderPaymentMethods } from "@/composables/orders/useOrderPaymentMethods";

const props = defineProps({
  order: { type: Object, required: true },
});

const emit = defineEmits(["update", "refresh"]);

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

const pad = (n) => String(n).padStart(2, "0");

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
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

// === Возврат оплаты ===

const refunding = ref(false);

// Кнопка видна только для реально оплаченных заказов, которые ещё не в
// одном из статусов "возврата". Показывать её для неоплаченных/уже
// возвращённых заказов не имеет смысла — backend всё равно откажет.
const canRefundPayment = computed(() => {
  const paymentStatus = extractValue(props.order?.payment_status);
  const orderStatus = extractValue(props.order?.status);
  return paymentStatus === "paid" && orderStatus !== "return_payment";
});

const onRefundPayment = async () => {
  if (
    !window.confirm(
      "Вернуть оплату по этому заказу? Действие необратимо и сразу инициирует возврат денег через платёжного провайдера.",
    )
  ) {
    return;
  }

  refunding.value = true;
  try {
    await axios.post(`/orders/${props.order.id}/refund-payment`);
    emit("refresh");
  } catch (error) {
    const message =
      error?.response?.data?.message || "Не удалось вернуть оплату";
    window.alert(message);
  } finally {
    refunding.value = false;
  }
};

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
    const payload = { [field]: value };

    // При переключении на «Оплачено» — автоматически проставить paid_at = now(),
    // если поле ещё не заполнено. При переключении на другой статус — сбросить.
    if (field === "payment_status") {
      if (value === "paid" && !localPaidAt.value) {
        const d = new Date();
        localPaidAt.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        payload.paid_at = localPaidAt.value;
      } else if (value !== "paid") {
        localPaidAt.value = "";
        payload.paid_at = null;
      }
    }

    await emit("update", payload);
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
  const value = localPaidAt.value || null;
  await onChange("paid_at", value);
};

</script>

<style scoped>
/* Скрываем AM/PM в Chromium-браузерах */
.paid-at-input::-webkit-datetime-edit-ampm-field {
  display: none;
}
</style>
