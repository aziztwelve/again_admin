<template>
  <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
    <h3 class="text-sm font-semibold text-gray-900">Платежи</h3>
    <ul v-if="payments.length" class="mt-3 space-y-3 text-sm">
      <li
        v-for="payment in payments"
        :key="payment.id"
        class="rounded border border-gray-200 p-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-gray-900">{{ payment.provider_label || payment.provider || "—" }}</span>
          <span class="rounded px-1.5 py-0.5 text-xs font-medium" :class="statusClass(payment.status)">
            {{ payment.status_label || payment.status }}
          </span>
        </div>
        <div class="mt-1 text-xs text-gray-700">{{ formatPrice(payment.amount) }}</div>
        <div v-if="payment.refund_label" class="text-xs text-purple-700">{{ payment.refund_label }}</div>
        <div v-if="payment.error_message" class="text-xs text-red-600">{{ payment.error_message }}</div>
        <div class="mt-1 text-xs text-gray-500">
          <span v-if="payment.provider_payment_id">№ в платёжной системе: {{ payment.provider_payment_id }} · </span>{{ formatDate(payment.created_at) }}
        </div>
      </li>
    </ul>
    <p v-else class="mt-2 text-sm text-gray-500">Нет платежей</p>
  </section>
</template>

<script setup>
defineProps({
  payments: { type: Array, default: () => [] },
});

const formatPrice = (value) => {
  const n = Number(value || 0);
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
  }).format(n);
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const statusClass = (status) =>
  ({
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-purple-100 text-purple-800",
  })[status] || "bg-gray-100 text-gray-700";
</script>
