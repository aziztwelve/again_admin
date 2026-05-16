<template>
  <DynamicsDataTable
      :data="clients"
      :columns="columns"
      :edit="edit"
      :loading="loading"
      :pagination="pagination"

      @save_changes="handlingUpdate($event)"
      @deleted="
      useClientFunctions().deleteClient($event.id);
      emits('deleted', $event)"
  >

    <template #addActions="{item}">
      <PromoCodeClientModal
          :client="item"
      />
    </template>

  </DynamicsDataTable>
</template>

<script setup lang="ts">
import ClientsEdit from '@/components/clients/Edit/Index.vue'
import {Check, X} from "lucide-vue-next";
import {h, PropType, ref, watch} from "vue";
import {RouterLink} from "vue-router";
import {useClientFunctions} from "@/composables/useClientFunctions";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {Client} from "@/models/client/Client";
import PromoCodeClientModal from "@/components/clients/Promo/PromoCodeClientModal.vue";
import {useDateFormat} from "@/composables/useDateFormat";
import {Pagination} from "@/types/Types";
import {useSelectableColumn} from "@/composables/useSelectableColumn";

const props = defineProps({
  clients: {
    type: Array as PropType<Client[]>,
    default: () => []
  },
  loading: Boolean,
  pagination: {
    type: Object as PropType<Pagination>,
  }
});

const emits = defineEmits(["deleted", "updated", "selectionChanged"]);


const {formatDateToRussian} = useDateFormat()
const {selectedIds, selectColumn, indexColumn} = useSelectableColumn(props.pagination)

// Следи за изменениями selectedIds и эмить наверх
watch(selectedIds, (newIds) => {
  emits('selectionChanged', newIds)
}, {deep: true})


async function handlingUpdate(data: Client) {
  await useClientFunctions().updateClient(data)
  emits('updated')
}

const edit = ref({
  title: "Редактирование клиента",
  description: "Измените данные клиента",
  component: ClientsEdit,
  loader: false,
});


const columns = [
  selectColumn,
  indexColumn,
  {
    accessorKey: "id",
    header: "ID",
    cell: ({row}: any) =>
        h(
            RouterLink,
            {
              to: `/clients/${row.original.id}`,
              class: "text-blue-600 hover:underline",
            },
            () => row.original.id
        ),
  },
  {
    accessorKey: "profile.fullName",
    header: "Клиент",
    cell: ({row}: any) => {
      const name = row.original?.profile?.fullName || '—';
      return h(
          RouterLink,
          {
            to: `/clients/${row.original.id}`,
            class: "text-blue-600 hover:underline",
          },
          () => name
      );
    }
  },

  {
    accessorKey: "profile.phone",
    header: "Телефон",
    cell: ({row}: any) =>
        h(
            "span",
            {class: "whitespace-nowrap"},
            row.original?.profile?.phone
        ),
  },

  {
    accessorKey: "email",
    header: "Почта",
  },


  {
    accessorKey: "profile.birthday",
    header: "Дата рождения",
    cell: (row: any) => {
      return h('span', {class: 'whitespace-nowrap'}, formatDateToRussian(row.getValue(), false));
    },
  },
  {
    accessorKey: "created_at",
    header: "Дата регистрации",
    cell: (row: any) => {
      return h('span', {class: 'whitespace-nowrap'}, formatDateToRussian(row.getValue()));
    },
  },

  {
    accessorKey: "profile.address",
    header: "Адрес",
  },
  {
    accessorKey: "isActive",
    header: "Активен",
    cell: (row: any) => {
      return row.getValue()
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },
];
</script>

<style scoped>

</style>