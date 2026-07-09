<template>
  <ModalDialog
      ref="modalRef"
      title="Выбрать промокод"
      description="Активные промокоды. Клик по строке применит промокод к заказу и пересчитает позиции."
      dynamic-style="sm:max-w-2xl"
  >
    <template #trigger>
      <Button type="button" variant="outline" class="gap-2">
        <TicketPercent class="h-4 w-4"/>
        {{ triggerLabel }}
      </Button>
    </template>

    <template #content>
      <div class="space-y-4">
        <div
            v-if="!clientId"
            class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
        >
          Клиент ещё не выбран — показаны только промокоды, доступные всем клиентам.
          После выбора клиента список расширится.
        </div>

        <div class="relative">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
          <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по коду или описанию"
              class="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div class="max-h-96 overflow-y-auto rounded-md border border-gray-200">
          <div v-if="isLoading" class="px-4 py-6 text-center text-sm text-gray-500">
            Загрузка...
          </div>

          <div
              v-else-if="filteredCodes.length"
              class="divide-y divide-gray-200"
          >
            <button
                v-for="code in filteredCodes"
                :key="code.id"
                type="button"
                class="flex w-full items-start justify-between gap-4 px-4 py-3 text-left transition hover:bg-gray-50"
                @click="handleSelect(code)"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-semibold text-gray-900">
                    {{ code.code }}
                  </p>
                  <span
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="discountTypeBadgeClass(code)"
                  >
                    {{ formatDiscount(code) }}
                  </span>
                </div>

                <p
                    v-if="code.description"
                    class="mt-1 truncate text-xs text-gray-500"
                >
                  {{ code.description }}
                </p>

                <p class="mt-1 text-xs text-gray-400">
                  {{ formatValidity(code) }}
                  <span v-if="code.max_uses">
                    · использовано {{ code.times_used ?? 0 }} / {{ code.max_uses }}
                  </span>
                </p>
              </div>

              <div class="shrink-0 text-right">
                <p
                    class="text-xs font-medium"
                    :class="code.applies_to_all_products ? 'text-emerald-600' : 'text-gray-500'"
                >
                  {{ code.applies_to_all_products ? 'Все товары' : 'Выборочно' }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  {{ behaviorLabel(code.discount_behavior) }}
                </p>
              </div>
            </button>
          </div>

          <div v-else class="px-4 py-6 text-sm text-gray-500">
            Промокоды не найдены.
          </div>
        </div>
      </div>
    </template>
  </ModalDialog>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue';
import axios from 'axios';
import {Search, TicketPercent} from 'lucide-vue-next';

import ModalDialog from '@/components/dynamics/shadcn/ModalDialog.vue';
import Button from '@/components/ui/button/Button.vue';

const props = defineProps({
  triggerLabel: {
    type: String,
    default: 'Выбрать купон',
  },
  // Если задан — показываем все активные купоны (бэкенд отсечёт неподходящие
  // при /promo-codes/validate). Если пуст — фильтруем на applies_to_all_clients=true,
  // потому что без клиента иначе мы не сможем валидировать выбор.
  clientId: {
    type: [Number, String],
    default: null,
  },
});

const emit = defineEmits(['select']);

const modalRef = ref(null);
const promoCodes = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');

const fetchPromoCodes = async () => {
  isLoading.value = true;
  try {
    const {data} = await axios.get('/promo-codes', {
      params: {is_active: 1, per_page: 200},
    });
    // Бэк отдаёт { success, data: [...], meta }. Поддерживаем и legacy-ключ promoCodes.
    const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.promoCodes)
            ? data.promoCodes
            : [];

    // Дополнительно отсекаем просроченные на клиенте
    // (на бэке index не фильтрует по дате). Невалидные для конкретного
    // клиента/состава товаров отсечёт /promo-codes/validate.
    const now = Date.now();
    promoCodes.value = list.filter((c) => {
      if (!c.is_active) return false;
      if (c.expires_at) {
        const expiresAt = Date.parse(c.expires_at);
        if (!Number.isNaN(expiresAt) && expiresAt < now) return false;
      }
      return true;
    });
  } catch (error) {
    console.error('Не удалось загрузить промокоды:', error);
    promoCodes.value = [];
  } finally {
    isLoading.value = false;
  }
};

const filteredCodes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const customerType = props.clientId ? 'authorized' : 'guest';
  const list = props.clientId
      ? promoCodes.value.filter((c) => !c.customer_type || c.customer_type === 'all' || c.customer_type === customerType)
      : promoCodes.value.filter((c) => {
        const target = c.customer_type || 'all';
        return c.applies_to_all_clients && (target === 'all' || target === customerType);
      });

  if (!query) return list;

  return list.filter((c) => {
    const inCode = (c.code || '').toLowerCase().includes(query);
    const inDesc = (c.description || '').toLowerCase().includes(query);
    return inCode || inDesc;
  });
});

const formatDiscount = (code) => {
  const amount = Number(code.discount_amount || 0);
  if (code.discount_type === 'percentage') {
    return `−${amount}%`;
  }
  return `−${new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount)}`;
};

const discountTypeBadgeClass = (code) => {
  return code.discount_type === 'percentage'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-blue-50 text-blue-700';
};

const formatValidity = (code) => {
  const fmt = (s) => {
    if (!s) return null;
    const date = new Date(s);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('ru-RU');
  };

  const start = fmt(code.starts_at);
  const end = fmt(code.expires_at);

  if (start && end) return `${start} — ${end}`;
  if (start) return `с ${start}`;
  if (end) return `до ${end}`;
  return 'Бессрочно';
};

const behaviorLabel = (behavior) => {
  switch (behavior) {
    case 'replace':
      return 'Заменяет скидку';
    case 'stack':
      return 'Поверх скидки';
    case 'skip':
      return 'Без товаров со скидкой';
    default:
      return '';
  }
};

const handleSelect = (code) => {
  emit('select', code);
  modalRef.value?.close?.();
};

const open = () => {
  modalRef.value?.open?.();
};

defineExpose({open});

onMounted(() => {
  fetchPromoCodes();
});

// Перезагружаем список при каждом открытии (на случай изменений на бэке)
watch(modalRef, (m) => {
  if (m) {
    // ничего, fetch уже сработал в onMounted
  }
});
</script>
