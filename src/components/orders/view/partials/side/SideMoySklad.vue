<template>
  <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
    <h3 class="text-sm font-semibold text-gray-900">МойСклад</h3>
    <dl class="mt-3 space-y-2 text-sm">
      <div>
        <dt class="text-xs uppercase text-gray-500">Заказ</dt>
        <dd>{{ order?.moysklad_order_uuid ? 'Выгружен' : 'Не выгружен' }}</dd>
      </div>
      <div v-if="order?.moysklad_synced_at">
        <dt class="text-xs uppercase text-gray-500">Последняя выгрузка</dt>
        <dd>{{ formatDate(order.moysklad_synced_at) }}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase text-gray-500">Оплата</dt>
        <dd>{{ order?.moysklad_paymentin_uuid ? 'Платёж передан' : 'Нет платежа' }}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase text-gray-500">Отгрузка</dt>
        <dd>{{ order?.moysklad_demand_uuid ? 'Создана' : 'Нет' }}</dd>
      </div>
    </dl>
    <div class="mt-3">
      <Button size="sm" variant="outline" :disabled="loading" @click="sync">
        {{ loading ? 'Выгрузка…' : order?.moysklad_order_uuid ? 'Выгрузить повторно' : 'Выгрузить в МойСклад' }}
      </Button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { toast } from 'vue-sonner';
import Button from '@/components/ui/button/Button.vue';

const props = defineProps({
  order: { type: Object, required: true },
});
const emit = defineEmits(['refresh']);
const loading = ref(false);

const formatDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('ru-RU');
};

const sync = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const { data } = await axios.post(`/orders/${props.order.id}/moysklad/sync`);
    toast.success(data?.message || 'Заказ выгружен в МойСклад');
    emit('refresh');
  } catch (error) {
    toast.error(error?.response?.data?.message || 'Не удалось выгрузить заказ в МойСклад');
  } finally {
    loading.value = false;
  }
};
</script>
