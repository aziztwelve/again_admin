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
      </h1>
    </div>

    <div class="flex items-center gap-2">
      <Button variant="outline" size="sm" type="button">
        <Truck class="mr-2 h-4 w-4" /> Оформить доставку
      </Button>
      <Button variant="outline" size="sm" type="button" @click="$emit('copy')">
        <Copy class="mr-2 h-4 w-4" /> Копировать
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
import { ArrowLeft, Truck, Copy, ChevronLeft, ChevronRight } from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";

defineProps({
  order: { type: Object, required: true },
  neighbors: { type: Object, default: () => ({ prev_id: null, next_id: null }) },
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
