<template>
  <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
    <h3 class="text-sm font-semibold text-gray-900">Платежи</h3>
    <ul v-if="payments.length" class="mt-3 space-y-3 text-sm">
      <li
        v-for="payment in payments"
        :key="payment.id"
        class="rounded border border-gray-200 p-2"
      >
        <div class="text-gray-900">
          {{ payment.payment_method || "—" }}
          <span v-if="payment.payment_provider" class="text-gray-500">
            ({{ payment.payment_provider }})
          </span>
        </div>
        <div class="text-xs text-gray-500">
          {{ formatPrice(payment.amount) }} · {{ payment.status }}
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
</script>
