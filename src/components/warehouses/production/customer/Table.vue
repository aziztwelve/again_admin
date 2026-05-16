<template>
  <DynamicsDataTable
      :data="data"
      :columns="columns"
      :custom-actions="true"
      :loading="loading"
  >
    <template #actions="{ row }">
      <CityZoneCustomerEditCustomActionsForDynamicTable
          v-if="row?.original"
          :item="row.original"
          :edit="edit"
          @save_changes="handleSaveChanges"
          @deleted="handleDelete($event.id)"
      />
    </template>
  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {CityZoneCustomer} from "~/services/CityZoneCustomer"
import CityZoneCustomerEdit from "@/components/city_zone/customer/edit/index.vue"
import {useCityZoneCustomerFunctions} from "~/composables/useCityZoneCustomerFunctions"

const props = defineProps({
  loading: Boolean,
  data: {
    type: Array as () => CityZoneCustomer[],
    default: () => []
  },
  customers: {
    type: Array,
    default: () => []
  }
})

const emits = defineEmits(["deleted", "updated"])

const edit = ref({
  title: "Редактирование клиента зоны",
  component: CityZoneCustomerEdit,
  loader: false
})

const columns = [
  {
    accessorKey: "id",
    header: "No",
    cell: (cell: any) => cell.row.index + 1
  },
  {
    accessorKey: "city_zone_name",
    header: "Название зоны",
    cell: ({row}: any) => row.original?.city_zone_name || '—'
  },
  {
    accessorKey: "customer_name",
    header: "Клиент",
    cell: ({row}: any) => row.original?.customer_name || '—'
  },
  {
    accessorKey: "customer_address_name",
    header: "Адрес",
    cell: ({row}: any) => row.original?.customer_address_name || '—'
  }
]

const handleDelete = async (id: number) => {
  const success = await useCityZoneCustomerFunctions().deleteCityZoneCustomer(id)
  if (success) emits("deleted")
}

const handleSaveChanges = async (data: CityZoneCustomer) => {
  const success = await useCityZoneCustomerFunctions().updateCityZoneCustomer(data.toJSONForUpdate())
  if (success) emits("updated")
}
</script>
