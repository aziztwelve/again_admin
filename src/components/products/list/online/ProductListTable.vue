<template>
  <div class="pb-1" v-if="selectedIds.length">
    <BulkActionsMenu
        :selected-ids="selectedIds"
        :actions="[
        { label: 'Активировать', icon: Eye, onClick: handleActivate },
        { label: 'Деактивировать', icon: EyeOff, onClick: handleDeactivate },
        { label: 'Пометить новинками', icon: Star, onClick: handleMarkAsNew },
        { label: 'Убрать из новинок', icon: StarOff, onClick: handleUnmarkAsNew },
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

    <template #actionsVariant="">
    </template>
  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {h} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {Product} from "@/models/Product";
import {ChevronRight, ChevronDown, Check, X} from 'lucide-vue-next'
import {useRouter} from "vue-router";
import {useImageFunctions} from "@/composables/useImageFunctions";
import IconButtons from "@/components/dynamics/IconButtons.vue";
import {useProductFunctions} from "@/composables/useProductFunctions";
import {useSelectableColumn} from "@/composables/useSelectableColumn";
import {Eye, EyeOff, Star, StarOff} from "lucide-vue-next"
import BulkActionsMenu from "@/components/dynamics/BulkActionsMenu.vue"
import EditableOrderCell from "@/components/products/list/online/EditableOrderCell.vue";
import EditableAbsorbencyCell from "@/components/products/list/online/AbsorbencyLevel/EditableAbsorbencyCell.vue";
import EditableFitTypeCell from "@/components/products/list/online/EditCell/EditableFitTypeCell.vue";
import {useProductAttributeFunctions} from "@/composables/Product/useProductAttributeFunctions";

interface Props {
  items: Product[];
  loading: boolean;
  showActionButton: boolean;
  showPrint: boolean;
}

withDefaults(defineProps<Props>(), {
  showActionButton: true,
  showPrint: true,
})

const emits = defineEmits(["deleted", "updated", "updated_absorbency_level"]);

const router = useRouter();

const {deleteProduct, bulkActivateProducts, bulkDeactivateProducts} = useProductFunctions()
const {bulkUpdateAttributes} = useProductAttributeFunctions()

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
        class: 'w-10 h-10 object-cover rounded',
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
          },
          `${product.name} ${product?.color ? ' / ' + product.color.name : ''}`
      );
    }
  },

  {
    accessorKey: "display_order",
    header: "Порядок",
    cell: ({row}: any) => {
      const product = row.original
      return h(EditableOrderCell, {
        productId: product.id,
        initialOrder: product.display_order,
        onUpdated: () => emits('updated')
      })
    }
  },

  {
    accessorKey: "absorbency_level",
    header: "Капли",
    cell: ({row}: any) => {
      const product = row.original
      return h(EditableAbsorbencyCell, {
        productId: product.id,
        initialAbsorbency: product.absorbency_level ?? 0,
      })
    }
  },

  {
    accessorKey: "fit_type",
    header: "Посадка",
    cell: ({row}: any) => {
      const product = row.original
      return h(EditableFitTypeCell, {
        productId: product.id,
        initialFitType: product.fit_type || null,
        onUpdated: (newValue) => {
          product.fit_type = newValue
        }
      })
    }
  },
  {
    accessorKey: "is_new",
    header: "Новинка",
    cell: ({row}: any) => {
      return row.original.is_new
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },
  {
    accessorKey: "stock_quantity",
    header: "Остаток",
  },

  {
    accessorKey: 'price',
    header: 'Цена продажи',
  },

  {
    header: "Скидка",
    accessorKey: "discount_percentage",
    cell: ({row}: any) =>
        h(
            "span",
            {class: "whitespace-nowrap"},
            `${row.original.discount_percentage ?? 0}%`
        ),
  },

  {
    accessorKey: 'old_price',
    header: 'Цена до скидки',
  },
  {
    accessorKey: 'code',
    header: 'Код',
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
];

// Существующие функции
async function handleActivate(ids: number[]) {
  await bulkActivateProducts(ids)
  emits('updated')
}

async function handleDeactivate(ids: number[]) {
  await bulkDeactivateProducts(ids)
  emits('updated')
}

async function handleMarkAsNew(ids: number[]) {
  await bulkUpdateAttributes({
    product_ids: ids,
    attributes: {
      is_new: true
    }
  })
  emits('updated')
}

async function handleUnmarkAsNew(ids: number[]) {
  await bulkUpdateAttributes({
    product_ids: ids,
    attributes: {
      is_new: false
    }
  })
  emits('updated')
}

</script>

<style scoped></style>