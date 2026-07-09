<template>
  <ModalDialog
      ref="modalRef"
      title="Выбрать скидку"
      description="Активные скидки. Клик по строке применит скидку к позициям заказа."
      dynamic-style="sm:max-w-2xl"
  >
    <template #trigger>
      <Button type="button" variant="outline" class="gap-2">
        <Tag class="h-4 w-4"/>
        {{ triggerLabel }}
      </Button>
    </template>

    <template #content>
      <div class="space-y-4">
        <div class="relative">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
          <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по названию"
              class="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div class="max-h-96 overflow-y-auto rounded-md border border-gray-200">
          <div v-if="isLoading" class="px-4 py-6 text-center text-sm text-gray-500">
            Загрузка...
          </div>

          <div v-else-if="filteredDiscounts.length" class="divide-y divide-gray-200">
            <button
                v-for="discount in filteredDiscounts"
                :key="discount.id"
                type="button"
                class="flex w-full items-start justify-between gap-4 px-4 py-3 text-left transition hover:bg-gray-50"
                @click="handleSelect(discount)"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-semibold text-gray-900">
                    {{ discount.name }}
                  </p>
                  <span
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="discount.type === 'percentage' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'"
                  >
                    {{ formatDiscount(discount) }}
                  </span>
                </div>

                <p class="mt-1 text-xs text-gray-400">
                  {{ formatValidity(discount) }}
                </p>
              </div>

              <div class="shrink-0 text-right">
                <p
                    class="text-xs font-medium"
                    :class="discount.discount_type === 'all' ? 'text-emerald-600' : 'text-gray-500'"
                >
                  {{ discountScopeLabel(discount) }}
                </p>
              </div>
            </button>
          </div>

          <div v-else class="px-4 py-6 text-sm text-gray-500">
            Скидки не найдены.
          </div>
        </div>
      </div>
    </template>
  </ModalDialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import axios from 'axios';
import { Search, Tag } from 'lucide-vue-next';
import ModalDialog from '@/components/dynamics/shadcn/ModalDialog.vue';
import Button from '@/components/ui/button/Button.vue';

const props = defineProps({
  triggerLabel: {
    type: String,
    default: 'Скидка',
  },
  clientId: {
    type: [Number, String],
    default: null,
  },
});

const emit = defineEmits(['select']);

const modalRef = ref(null);
const discounts = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');

const fetchDiscounts = async () => {
  isLoading.value = true;
  try {
    const { data } = await axios.get('/discounts', {
      params: { per_page: 200 },
    });
    const list = Array.isArray(data?.data) ? data.data : [];
    const now = Date.now();
    discounts.value = list.filter((d) => {
      if (!d.is_active) return false;
      if (d.ends_at) {
        const endsAt = Date.parse(d.ends_at);
        if (!Number.isNaN(endsAt) && endsAt < now) return false;
      }
      return true;
    });
  } catch (error) {
    console.error('Не удалось загрузить скидки:', error);
    discounts.value = [];
  } finally {
    isLoading.value = false;
  }
};

const filteredDiscounts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const customerType = props.clientId ? 'authorized' : 'guest';
  const byCustomer = discounts.value.filter((d) => {
    const target = d.customer_type || 'all';
    return target === 'all' || target === customerType;
  });

  if (!query) return byCustomer;
  return byCustomer.filter((d) => (d.name || '').toLowerCase().includes(query));
});

const formatDiscount = (discount) => {
  const value = Number(discount.value || 0);
  if (discount.type === 'percentage') {
    return `−${value}%`;
  }
  return `−${new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value)}`;
};

const formatValidity = (discount) => {
  const fmt = (s) => {
    if (!s) return null;
    const date = new Date(s);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('ru-RU');
  };
  const start = fmt(discount.starts_at);
  const end = fmt(discount.ends_at);
  if (start && end) return `${start} — ${end}`;
  if (start) return `с ${start}`;
  if (end) return `до ${end}`;
  return 'Бессрочно';
};

const discountScopeLabel = (discount) => {
  switch (discount.discount_type) {
    case 'all': return 'Все товары';
    case 'specific': return 'Выборочно';
    case 'category': return 'По категории';
    default: return '';
  }
};

const handleSelect = (discount) => {
  emit('select', discount);
  modalRef.value?.close?.();
};

const open = () => {
  modalRef.value?.open?.();
};

defineExpose({ open });

onMounted(() => {
  fetchDiscounts();
});
</script>
