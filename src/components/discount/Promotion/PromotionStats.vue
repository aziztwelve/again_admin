<template>
  <div class="space-y-4">
    <Loader v-if="isLoading" />

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-gray-500"
              >Всего использований</CardTitle
            >
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats?.total_uses || 0 }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-gray-500"
              >Заказов с акцией</CardTitle
            >
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats?.total_orders || 0 }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-gray-500"
              >Общая выручка</CardTitle
            >
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ formatCurrency(stats?.total_revenue || 0) }}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-gray-500"
              >Средний чек</CardTitle
            >
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{
                formatCurrency(
                  stats?.total_orders
                    ? stats.total_revenue / stats.total_orders
                    : 0,
                )
              }}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние использования</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            v-if="stats?.recent_usages && stats.recent_usages.length > 0"
            class="space-y-2"
          >
            <div
              v-for="usage in stats.recent_usages"
              :key="usage.id"
              class="flex items-center justify-between p-3 border rounded"
            >
              <div>
                <div class="font-medium">Заказ #{{ usage.order_id }}</div>
                <div class="text-sm text-gray-500">
                  Клиент ID: {{ usage.client_id }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500">
                  {{ formatDate(usage.used_at) }}
                </div>
                <div
                  v-if="usage.gift_product_id"
                  class="text-xs text-green-600"
                >
                  Подарок: ID {{ usage.gift_product_id }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-8">
            Нет данных об использовании
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loader from "@/components/common/Loader.vue";
import { useDateFormat } from "@/composables/useDateFormat";
import { usePromotionFunctions } from "@/composables/usePromotionFunctions";

const props = defineProps({
  promotionId: {
    type: Number,
    required: true,
  },
});

const stats = ref<any | null>(null);
const isLoading = ref(true);

const { formatDateToRussian } = useDateFormat();
const { getPromotionStats } = usePromotionFunctions();

onMounted(async () => {
  await loadStats();
});

const loadStats = async () => {
  isLoading.value = true;
  stats.value = await getPromotionStats(props.promotionId);
  isLoading.value = false;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date: string) => {
  return formatDateToRussian(date);
};
</script>

<style scoped></style>
