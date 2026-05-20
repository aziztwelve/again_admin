<template>
  <div class="flex items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <router-link to="/orders/list" class="text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft class="h-4 w-4" />
      </router-link>
      <h1 class="text-lg font-semibold text-gray-900">
        Заказ №{{ order.order_number || order.id }}
        <span class="ml-2 text-sm font-normal text-gray-500">
          от {{ formatDate(order.created_at) }}
        </span>
        <!--
          Заказ оформлен гостем (без аккаунта в clients): client_id === null.
          Контактные данные хранятся в самом заказе и в order_addresses.recipient_*.
          Бейдж нужен, чтобы менеджер сразу видел: клиента в базе нет — связаться
          можно только по телефону/email из заказа.
        -->
        <span
          v-if="!order.client_id"
          class="ml-3 inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
          title="Заказ оформлен без авторизации"
        >
          Гостевой заказ
        </span>
      </h1>
      <a
        v-if="viewOrderUrl"
        :href="viewOrderUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="ml-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
      >
        <ExternalLink class="h-3.5 w-3.5" />
        Открыть заказ на сайте
      </a>
    </div>

    <div class="flex items-center gap-2">
      <Button variant="outline" size="sm" type="button" :disabled="copying" @click="$emit('copy')">
        <Copy class="mr-2 h-4 w-4" />
        {{ copying ? 'Копирование...' : 'Копировать' }}
      </Button>

      <router-link
        v-if="neighbors.prev_id"
        :to="`/order/${neighbors.prev_id}`"
        class="inline-flex"
      >
        <Button variant="outline" size="icon" type="button">
          <ChevronLeft class="h-4 w-4" />
        </Button>
      </router-link>
      <Button v-else variant="outline" size="icon" type="button" :disabled="true">
        <ChevronLeft class="h-4 w-4" />
      </Button>

      <router-link
        v-if="neighbors.next_id"
        :to="`/order/${neighbors.next_id}`"
        class="inline-flex"
      >
        <Button variant="outline" size="icon" type="button">
          <ChevronRight class="h-4 w-4" />
        </Button>
      </router-link>
      <Button v-else variant="outline" size="icon" type="button" :disabled="true">
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft, Copy, ChevronLeft, ChevronRight, ExternalLink } from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";

defineProps({
  order: { type: Object, required: true },
  neighbors: { type: Object, default: () => ({ prev_id: null, next_id: null }) },
  viewOrderUrl: { type: String, default: null },
  copying: { type: Boolean, default: false },
});

defineEmits(["copy"]);

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
</script>
