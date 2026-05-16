<template>
  <DynamicsDataTable
      v-if="clients?.length"
      :data="clients"
      :columns="columns"
      :edit="edit"
      :loading="loading"
      @save_changes="handlingUpdate($event)"
      @deleted="
      useClientFunctions().deleteClient($event.id);
      emits('deleted', $event);
    "
  />
</template>

<script setup lang="ts">
import ClientsEdit from '@/components/clients/Edit/Index.vue'
import {Check, X} from "lucide-vue-next";
import {h, PropType, ref} from "vue";
import {useClientFunctions} from "@/composables/useClientFunctions";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {Client} from "@/models/client/Client";

const props = defineProps({
  clients: {
    type: Array as PropType<Client[]>,
    default: () => []
  },
  loading: Boolean,
});

const emits = defineEmits(["deleted", "updated"]);


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
  {
    accessorKey: "id",
    header: "No",
    cell: (cell) => {
      return (cell.row.index += 1);
    },
  },
  {
    accessorKey: "profile.fullName",
    header: "Заголовок",
    cell: (row) => {
      return row.row.original.profile?.fullName || '—';
    }
  },
  {
    accessorKey: "profile.name",
    header: "Значение",
    cell: (row) => {
      return row.row.original.profile?.phone || '—';
    }
  },


];
</script>

<style scoped></style>