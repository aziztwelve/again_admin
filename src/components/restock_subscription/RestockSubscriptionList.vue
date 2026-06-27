<template>
  <div class="flex justify-between mb-2 md:space-x-4 max-md:flex-col max-md:space-y-2">
    <div class="flex items-center gap-3">
      <DynamicTitle
          title="Заявки: Скоро в продаже"
          variant="primary"
      />
      <span
          v-if="pendingCount > 0"
          class="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-red-600 text-white text-xs font-semibold"
          title="Ожидают поступления"
      >
        {{ pendingCount }}
      </span>
    </div>

    <div class="flex md:space-x-2 max-md:space-y-2 max-md:flex-col">
      <input
          v-model="searchParams.search"
          type="text"
          placeholder="Имя, email или телефон"
          class="h-9 px-3 rounded-md border border-input bg-background text-sm"
          @keyup.enter="fetchData"
      />

      <select
          v-model="searchParams.status"
          class="h-9 px-3 rounded-md border border-input bg-background text-sm"
          @change="onFilterChange"
      >
        <option value="">Все статусы</option>
        <option value="pending">Ожидают</option>
        <option value="notified">Уведомлены</option>
      </select>

      <Button variant="outline" @click="fetchData">Поиск</Button>

      <Button
          v-if="hasActiveFilters"
          variant="outline"
          @click="resetFilters"
      >
        <X/>
      </Button>
    </div>
  </div>

  <DynamicsDataTable
      :data="subscriptions"
      :columns="columns"
      :show-print-button="false"
      :pagination="pagination"
      :loading="sending"
      @deleted="handleDeleted"
  />
</template>

<script setup lang="ts">
import {ref, onMounted, computed, watch, h} from 'vue';
import DynamicTitle from "@/components/dynamics/DynamicTitle.vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import Button from "@/components/ui/button/Button.vue";
import {X} from "lucide-vue-next";
import {useDateFormat} from "@/composables/useDateFormat";
import {useTableColumns} from "@/composables/Table/useTableColumns";
import {
  useRestockSubscriptionFunctions,
  RestockSubscription
} from "@/composables/useRestockSubscriptionFunctions";
import {PaginationMeta} from "@/types/Types";

const {getRestockSubscriptions, getCount, deleteRestockSubscription, sending} = useRestockSubscriptionFunctions();
const {createIndexColumn} = useTableColumns();

const searchParams = ref({
  search: '',
  status: '',
});

const pendingCount = ref(0);

const hasActiveFilters = computed(() => !!searchParams.value.search || !!searchParams.value.status);

const pagination = ref<PaginationMeta>({
  page: 1,
  per_page: 15,
  total: 0,
});

const subscriptions = ref<RestockSubscription[]>([]);

const statusLabels: Record<string, { label: string, color: string }> = {
  pending: {label: 'Ожидает', color: '#d97706'},
  notified: {label: 'Уведомлён', color: '#16a34a'},
};

const columns = [
  createIndexColumn(pagination.value),
  {
    accessorKey: "created_at",
    header: "Создана",
    cell: ({row}: any) =>
        h("span", {class: "whitespace-nowrap"},
            useDateFormat().formatDateToRussian(row.original?.created_at)),
  },
  {
    accessorKey: "product.name",
    header: "Товар",
    cell: ({row}: any) => h("span", {}, row.original?.product?.name ?? '—'),
  },
  {
    accessorKey: "name",
    header: "Имя",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Телефон",
    cell: ({row}: any) => h("span", {class: "whitespace-nowrap"}, row.original.phone ?? '—'),
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({row}: any) => {
      const s = statusLabels[row.original.status] ?? {label: row.original.status, color: '#6b7280'};
      return h("span", {
        style: {backgroundColor: s.color},
        class: `px-2 py-1 rounded text-white whitespace-nowrap`,
      }, s.label);
    },
  },
  {
    accessorKey: "client.email",
    header: "Клиент",
    cell: ({row}: any) => h("span", {}, row.original?.client?.email ?? '—'),
  },
];

async function fetchData() {
  const result = await getRestockSubscriptions({
    status: searchParams.value.status,
    search: searchParams.value.search,
    page: pagination.value.page,
    per_page: pagination.value.per_page,
  });

  subscriptions.value = result?.subscriptions ?? [];
  pagination.value.total = result?.meta.total ?? 0;
}

async function refreshCount() {
  pendingCount.value = await getCount();
}

function onFilterChange() {
  pagination.value.page = 1;
  fetchData();
}

function resetFilters() {
  searchParams.value = {search: '', status: ''};
  pagination.value.page = 1;
  fetchData();
}

onMounted(async () => {
  await fetchData();
  await refreshCount();
});

watch(
    () => [pagination.value.page, pagination.value.per_page],
    () => fetchData()
);

async function handleDeleted(item: RestockSubscription) {
  if (!item.id) return;
  await deleteRestockSubscription(item.id);
  await fetchData();
  await refreshCount();
}
</script>
