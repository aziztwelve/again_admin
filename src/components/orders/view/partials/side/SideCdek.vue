<template>
  <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
    <h3 class="text-sm font-semibold text-gray-900">СДЭК</h3>
    <template v-if="isCdekDelivery">
      <dl class="mt-3 space-y-2 text-sm">
        <div><dt class="text-xs uppercase text-gray-500">Создание</dt><dd>{{ creationStateLabel }}</dd></div>
        <div><dt class="text-xs uppercase text-gray-500">Статус</dt><dd>{{ cdekOrder?.status_name || cdekOrder?.status_code || '—' }}</dd></div>
        <div v-if="cdekOrder?.cdek_number"><dt class="text-xs uppercase text-gray-500">Номер СДЭК</dt><dd>{{ cdekOrder.cdek_number }}</dd></div>
        <div v-if="delivery.tariff_name"><dt class="text-xs uppercase text-gray-500">Тариф</dt><dd>{{ delivery.tariff_name }}</dd></div>
        <div v-if="delivery.pvz?.address"><dt class="text-xs uppercase text-gray-500">ПВЗ</dt><dd>{{ delivery.pvz.address }}</dd></div>
      </dl>
      <p v-if="cdekOrder?.last_error" class="mt-3 rounded bg-red-50 p-2 text-xs text-red-700">{{ cdekOrder.last_error }}</p>
      <a v-if="cdekOrder?.tracking_url" :href="cdekOrder.tracking_url" target="_blank" rel="noopener noreferrer" class="mt-3 inline-block text-xs font-medium underline">Открыть отслеживание</a>
      <div class="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" :disabled="loading || creationQueued" @click="createOrSync">
          {{ cdekOrder?.cdek_uuid ? 'Обновить статус' : creationQueued ? 'Заявка отправлена' : 'Создать заявку' }}
        </Button>
        <Button v-if="cdekOrder?.cdek_uuid && !isFinal" size="sm" variant="destructive" :disabled="loading" @click="cancel">
          Отменить доставку
        </Button>
      </div>
    </template>
    <p v-else class="mt-2 text-sm text-gray-500">Для этого заказа не выбрана доставка СДЭК.</p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import axios from 'axios';
import Button from '@/components/ui/button/Button.vue';
import { toast } from 'vue-sonner';

const props = defineProps({
  order: { type: Object, required: true },
});
const emit = defineEmits(['refresh']);
const loading = ref(false);
const delivery = computed(() => props.order?.delivery_data || {});
const isCdekDelivery = computed(() => String(props.order?.delivery_method?.code || props.order?.deliveryMethod?.code || '').startsWith('cdek_'));
const cdekOrder = computed(() => props.order?.cdek_order || props.order?.cdekOrder || null);
const isFinal = computed(() => ['DELIVERED', 'NOT_DELIVERED', 'RETURNED_TO_SENDER'].includes(cdekOrder.value?.status_code));
const creationQueued = computed(() => ['QUEUED', 'ACCEPTED'].includes(String(cdekOrder.value?.creation_state || '')));
const creationStateLabel = computed(() => cdekOrder.value?.creation_state === 'QUEUED'
  ? 'В очереди на создание'
  : cdekOrder.value?.creation_state || 'Заявка ещё не создана');

const createOrSync = async () => {
  if (loading.value || creationQueued.value) return;

  loading.value = true;
  try {
    await axios.post(`/orders/${props.order.id}/cdek-delivery/create`);
    emit('refresh');
  } catch (error) {
    toast.error(error?.response?.data?.message || 'Не удалось создать заявку СДЭК');
  } finally {
    loading.value = false;
  }
};

const cancel = async () => {
  if (!window.confirm('Отменить заявку в СДЭК?')) return;
  loading.value = true;
  try {
    await axios.post(`/orders/${props.order.id}/cdek-delivery/cancel`);
    emit('refresh');
  } finally {
    loading.value = false;
  }
};
</script>
