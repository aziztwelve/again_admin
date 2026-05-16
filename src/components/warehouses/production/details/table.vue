<template>
  <DynamicsDataTable
      :data="data"
      :columns="columns"
      :custom-actions="true"
      :loading="loading"
  >
  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {CityZoneCustomer} from "~/services/CityZoneCustomer"


const props = defineProps({
  loading: Boolean,
  data: {
    type: Array as () => CityZoneCustomer[],
    default: () => []
  },
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


</script>
