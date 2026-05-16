<template>
  <div class="space-y-4">
    <DynamicsDataTable
        :data="submissions"
        :columns="columns"
        :loading="sending"
        :pagination="pagination"
        :show-print-button="false"
        :custom-actions="true"
    >
      <template #addActions="{item}">

      </template>

    </DynamicsDataTable>
  </div>


</template>

<script setup lang="ts">
import {ref, onMounted, h, watch} from 'vue'
import {useOtoBannerSubmissions} from '@/features/oto-banner/composables/useOtoBannerSubmissions'
import {OtoBannerSubmission, getSubmissionStatusLabel} from '@/features/oto-banner/types'
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {useTableColumns} from "@/composables/Table/useTableColumns";
import {useDateFormat} from "@/composables/useDateFormat";
import {PaginationMeta} from "@/types/Types";

interface Props {
  bannerId: number
}

const props = defineProps<Props>()

const {getBannerSubmissions, sending} = useOtoBannerSubmissions()

const submissions = ref<OtoBannerSubmission[]>([])

const pagination = ref<PaginationMeta>({
  page: 1,
  per_page: 10,
  total: 0,
})

onMounted(async () => {
  await loadSubmissions()
})

const loadSubmissions = async () => {
  try {
    const response = await getBannerSubmissions(props.bannerId,
        {
          page: pagination.value.page,
          per_page: pagination.value.per_page,
        })
    submissions.value = response?.data || []
    pagination.value.total = response?.meta?.total ?? 0
  } catch (error) {
    console.error(error)
  } finally {
  }
}


const getStatusLabel = (status: string) => {
  return getSubmissionStatusLabel(status)
}

const {createIndexColumn} = useTableColumns()

const columns = [

  createIndexColumn(pagination.value),

  {
    accessorKey: "created_at",
    header: "Дата",
    cell: ({row}: any) => {
      return useDateFormat().formatDateToRussian(row.original.created_at)
    }
  },


  {
    accessorKey: "status",
    header: "Статус",
    cell: ({row}: any) => {
      const status = row.original.status;

      const statusClasses = {
        'processed': 'bg-green-100 text-green-700',
        'viewed': 'bg-yellow-100 text-yellow-700',
        'new': 'bg-blue-100 text-blue-700',
      }[status] || '';

      return h('span', {
        class: `px-2 py-1 rounded text-xs ${statusClasses}`
      }, getStatusLabel(status));
    },
  },

  {
    accessorKey: "email",
    header: "Email/Телефон",
    cell: ({row}: any) => {
      return row.original.email || row.original.phone;
    }
  },


  {
    accessorKey: "client.name",
    header: "Клиент",
  },

  {
    accessorKey: "client.email",
    header: "Клиент email",
  },

  {
    accessorKey: "manager.name",
    header: "Менеджер",
  },

  {
    accessorKey: "meta.input_fields.value",
    header: "Сообщение",
  },


]


watch(
    () => [pagination.value.page, pagination.value.per_page],
    () => loadSubmissions()
)

</script>