<template>
  <DynamicsDataTable
      :data="banners"
      :columns="columns"
      :loading="loading"
      :edit="edit"
      :pagination="pagination"
      :show-print-button="false"
      @save_changes="emits('updateEmit', $event)"
      @deleted="emits('deleteEmit', $event)"
  >

    <template #addActions="{item}">

      <button
          @click="handleToggleStatus(item)"
          :title="item.is_active ? 'Деактивировать' : 'Активировать'"
          class="inline-flex items-center justify-center cursor-pointer transition"
          :class="item.is_active ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-500'"
      >
        <Power :size="17"/>
      </button>

      <button
          @click="handleDuplicate(item)"
          title="Дублировать"
          class="inline-flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-500"
      >
        <Copy :size="17"/>
      </button>

      <button
          @click="navigateToDetail(item.id)"
          title="Аналитика"
          class="inline-flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-500"
      >
        <BarChart3 :size="17"/>
      </button>

    </template>

  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {h, ref} from "vue"
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue"
import {PaginationMeta} from "@/types/Types"
import {OtoBanner} from "@/features/oto-banner/types"
import {Check, X, Power, Copy, BarChart3} from "lucide-vue-next"
import OtoBannerEdit from "../edit/OtoBannerEdit.vue"
import {useTableColumns} from "@/composables/Table/useTableColumns"
import router from "@/router"
import {useDateFormat} from "@/composables/useDateFormat";

interface OtoBannerTableProps {
  banners: OtoBanner[]
  pagination: PaginationMeta
  loading: boolean
}

const props = defineProps<OtoBannerTableProps>()

const emits = defineEmits<{
  (e: 'deleteEmit', banner: OtoBanner): void
  (e: 'updateEmit', banner: OtoBanner): void
  (e: 'duplicateEmit', banner: OtoBanner): void
  (e: 'toggleStatusEmit', banner: OtoBanner): void
}>()


const edit = ref({
  title: "Редактирование баннера",
  description: "Измените данные баннера",
  component: OtoBannerEdit,
  loader: false,
  dynamicStyle: "md:min-w-[60%]"
})

const handleDuplicate = (banner: OtoBanner) => {
  emits('duplicateEmit', banner)
}

const handleToggleStatus = (banner: OtoBanner) => {
  emits('toggleStatusEmit', banner)
}

const navigateToDetail = (id: number) => {
  router.push(`/settings/oto/${id}`)
}

const {createIndexColumn, createClickableColumn} = useTableColumns()

const columns = [

  createIndexColumn(props.pagination),

  createClickableColumn(
      'name',
      'Название',
      (banner: OtoBanner) => {
        router.push(`/settings/oto/${banner.id}`)
      }
  ),

  {
    accessorKey: "image.url",
    header: "Фото",
    cell: ({row}: any) => {
      if (row.original.image?.url) {
        return h('img', {
          src: row.original.image?.url,
          alt: row.original.name,
          class: 'w-16 h-10 object-cover rounded'
        })
      }
      return h('span', {class: 'text-gray-400 text-sm'}, '−')
    }
  },
  {
    accessorKey: "device_type_label",
    header: "Устройство",
  },

  {
    accessorKey: "title",
    header: "Заголовок",
    cell: ({row}: any) => {
      const title = row.original.title || '-'
      return h('span', {class: 'text-xs'}, title)
    }
  },

  {
    accessorKey: "views_count",
    header: "Показов",
    cell: ({row}: any) => {
      return row.original.views_count || 0
    }
  },

  {
    accessorKey: "submissions_count",
    header: "Заявок",
    cell: ({row}: any) => {
      return row.original.submissions_count || 0
    }
  },

  {
    accessorKey: "conversion_rate",
    header: "Конверсия",
    cell: ({row}: any) => {
      const rate = row.original.conversion_rate || 0
      return `${rate}%`
    }
  },

  {
    accessorKey: "status",
    header: "Статус",
    cell: ({row}: any) => {
      return row.original.is_active
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"})
    },
  },

  {
    accessorKey: "display_delay_seconds",
    header: "Задержка (сек)",
  },


  {
    accessorKey: "promo_code.code",
    header: "Промокод",
    cell: ({row}: any) => {
      const code = row.original.promo_code?.code;
      return code ? code : '—';
    }
  },

  {
    accessorKey: "created_at",
    header: "Создан",
    cell: ({row}: any) => {
      return useDateFormat().formatDateToRussian(row.original.created_at)
    }
  },

]
</script>

<style scoped>

</style>