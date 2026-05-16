<template>
  <div class="pb-1" v-if="selectedIds.length">
    <BulkActionsMenu
        :selected-ids="selectedIds"
        :actions="[
        { label: 'Активировать', icon: Eye, onClick: handleActivate },
        { label: 'Деактивировать', icon: EyeOff, onClick: handleDeactivate },
      ]"
    />
  </div>

  <DynamicsDataTable
      :data="items"
      :columns="columns"
      :custom-actions="true"
      :show-print-button="showPrint"
  >
    <template v-if="showActionButton" #actions="{row}">
      <IconButtons
          :buttons="[
              { type: 'edit', onClick: editProduct },
              { type: 'delete', onClick: deleteProductHandle }
              ]"
          :context="row.original"
      />

    </template>

    <template #actionsVariant="{row}">

    </template>
  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {h, onMounted, PropType, ref} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import usePermission from "@/composables/usePermission";
import {Product} from "@/models/Product";
import {ChevronRight, ChevronDown, Check, X} from 'lucide-vue-next'
import {useRouter} from "vue-router";
import {useImageFunctions} from "@/composables/useImageFunctions";
import IconButtons from "@/components/dynamics/IconButtons.vue";
import {useProductFunctions} from "@/composables/useProductFunctions";
import {useSelectableColumn} from "@/composables/useSelectableColumn";
import {Eye, EyeOff} from "lucide-vue-next"
import BulkActionsMenu from "@/components/dynamics/BulkActionsMenu.vue"

const props = defineProps({
  items: {
    type: Array as PropType<Product[]>,
    default: () => []
  },
  loading: Boolean,

  showActionButton: {
    type: Boolean,
    default: true
  },

  showPrint: {
    type: Boolean,
    default: true
  }

});

const emits = defineEmits(["deleted", "updated"]);

const router = useRouter();


const {deleteProduct, bulkActivateProducts, bulkDeactivateProducts} = useProductFunctions()

const editProduct = (product: Product) => {
  router.push(`/product/update/${product.id}`)
};
const deleteProductHandle = async (product: Product) => {
  await deleteProduct(product.id, {})
  emits('deleted')
};


const {getImageByNameProduct} = useImageFunctions()


const {selectedIds, selectColumn} = useSelectableColumn()

const columns = [
  selectColumn,

  {
    id: 'expander',
    header: '',
    cell: ({row}: any) => (
        row.getCanExpand()
            ? h('button', {
              onClick: row.getToggleExpandedHandler(),
              class: 'p-1'
            }, [
              row.getIsExpanded()
                  ? h(ChevronDown, {class: 'w-4 h-4'})
                  : h(ChevronRight, {class: 'w-4 h-4'})
            ])
            : null

    ),
    meta: {isExpander: true},
  },


  {
    accessorKey: "id",
    header: "№",
  },

  {
    accessorKey: "image",
    header: "Фото",
    cell: ({row}: any) => {
      const imageName = row.original?.main_image?.path;

      return h('img', {
        src: getImageByNameProduct(imageName, 'md'),
        alt: imageName,
        class: 'w-10 h-10 object-cover rounded', // можно настроить
      });
    }
  },

  {
    accessorKey: "name",
    header: "Название",
    cell: ({row}: any) => {
      const product = row.original;

      return h('span', {
        class: 'text-blue-500 cursor-pointer hover:underline',
        onClick: () => editProduct(product)
      }, product.name);
    }
  },

  {
    accessorKey: "stock_quantity",
    header: "Остаток",
  },
  {
    header: "Цена",
    accessorKey: "price",
    cell: ({row}: any) =>
        h(
            "span",
            {class: "whitespace-nowrap"},
            row.original.price
        ),
  },
  {
    header: "Старая цена",
    accessorKey: "old_price",
    cell: ({row}: any) =>
        h(
            "span",
            {class: "whitespace-nowrap"},
            row.original.old_price
        ),
  },
  {
    accessorKey: "cost_price",
    header: "Цена закупки",
    cell: ({row}: any) =>
        h(
            "span",
            {class: "whitespace-nowrap"},
            row.original.cost_price
        ),

  },
  {
    accessorKey: "barcode",
    header: "Штрих-код",
  },
  {
    accessorKey: "code",
    header: "Код",
  },

  {
    accessorKey: "is_active",
    header: "Активен",
    cell: ({row}: any) => {
      return row.original.is_active
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },

  // {
  //   accessorKey: "sku",
  //   header: "Артикул",
  // },
  {
    accessorKey: "dimensions",
    header: "Габариты (д*ш*в)",
    cell: ({row}: any) => {
      const {length, width, height} = row.original;
      return [length, width, height].filter(Boolean).join(" x ") || "";
    }
  },
  {
    accessorKey: "weight",
    header: "Вес(гр)",
  },

  {
    accessorKey: "description",
    header: "Описание",
  },

];

async function handleActivate(ids: number[]) {
  console.log("Активировать:", ids)
  await bulkActivateProducts(ids)
  emits('updated')
}

async function handleDeactivate(ids: number[]) {
  console.log("Деактивировать:", ids)
  await bulkDeactivateProducts(ids)
  emits('updated')
}

</script>

<style scoped></style>
