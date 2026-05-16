<template>
  <Loader v-if="loading"/>
  <DynamicsDataTable
      v-else
      :key="renderTable"
      :data="product.variants || []"
      :columns="columns ?? []"
      :custom-actions="true"
      :show-print-button="false"
  >
    <template #actions="{row}">
      <Trash2
          @click="product.deleteProductByUuidToVariants(row.original.uuid); emits('deleted')"
          class="text-gray-400 hover:text-gray-500 transition cursor-pointer"
          :size="17"
      />

    </template>
  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {Trash2} from "lucide-vue-next";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {Product} from "@/models/Product";
import {Input} from '@/components/ui/input'
import {h, onMounted, ref} from "vue"
import ProductImage from "@/components/products/create/ProductImage.vue";
import {ImageModel} from "@/models/ImageModel";
import {useColorsFunctions} from "@/composables/useColorFunctions";
import ModalSelectColor from "@/components/products/create/partials/ModalSelectColor.vue";
import Loader from "@/components/common/Loader.vue";


const props = defineProps({
  product: {
    type: Product,
    required: true,
  },
});

const loading = ref(true);

const emits = defineEmits(["deleted", "updated", 'updatedVariantImage']);

const renderTable = ref(1)


const {getColors} = useColorsFunctions()

const colors = ref()
const columns = ref()


onMounted(async () => {
  colors.value = await getColors()
  columns.value = await getColumns()
  loading.value = false
})

async function getColumns() {
  return [
    {
      accessorKey: "id",
      header: "No",
      cell: (cell: any) => {
        return (cell.row.index += 1);
      },
    },

    {
      accessorKey: "images",
      header: "Фото",
      cell: (cell: any) => h(ProductImage, {
        item: cell.row.original ?? {},
        onUploaded: (event: ImageModel) => {
          // emits('updatedVariantImage', event);
          // cell.row.original?.images.push(event)

          // console.log(cell.row.original);
        },
        class: "text-center",
      })
    },

    {
      accessorKey: 'name',
      header: 'Название',
      cell: ({row}: any) => {
        return h(Input, {
          modelValue: row.original.name,
          'onUpdate:modelValue': (val: any) => {
            row.original.name = val
          },
          class: 'w-full text-center',
          type: 'text',
          placeholder: "Пример xs черный",
        })
      },
    },

    {
      accessorKey: 'barcode',
      header: 'Штрих код',
      cell: ({row}: any) => {
        return h('div', {class: 'flex flex-col items-center'}, [
          h(Input, {
            modelValue: row.original.barcode,
            readonly: true,
            class: 'w-full text-center bg-gray-100 text-gray-500 cursor-not-allowed',
            type: 'text',
            placeholder: "Создаётся в МойСклад",
          }),
          // h('p', {
          //   class: 'text-xs text-gray-400 mt-1',
          // }, 'Создаётся в МойСклад')
        ])
      },
    },

    {
      accessorKey: 'price',
      header: 'Цена',
      cell: ({row}: any) => {
        return h(Input, {
          modelValue: row.original.price,
          'onUpdate:modelValue': (val: any) => {
            row.original.price = Number(val)
          },
          class: 'w-24 text-center whitespace-nowrap whitespace-nowrap',
          type: 'number',
          placeholder: "Цена",
          min: 0,
        })
      },
    },

    {
      accessorKey: 'color_id',
      header: 'Цвет',
      cell: ({row}: any) => {
        return h(ModalSelectColor, {
          item: row.original,
          colors: colors.value,
          onUpdateColor: () => {
            renderTable.value++
          }
        })
      },
    },

    {
      accessorKey: 'cost_price',
      header: 'Цена закупкы',
      cell: ({row}: any) => {
        return h(Input, {
          modelValue: row.original.cost_price,
          'onUpdate:modelValue': (val: any) => {
            row.original.cost_price = val
          },
          class: 'w-24 text-center whitespace-nowrap',
          type: 'number',
          placeholder: "Цена закупкы",
          min: 0,
        })
      },
    },

  ];
}

</script>

<style scoped></style>
