<template>
  <DynamicsDataTable
      :data="items"
      :columns="columns"
      :custom-actions="true"
      :show-print-button="showPrint"
  >
    <template #actions="{row}">
      <X v-if="selectedList.some(p => p.id === row.original.id)"
         class="cursor-pointer  hover:text-red-600 text-red-500"
         @click="emits('removeToSelectList', row.original);"
      />
      <Check v-else
             class="cursor-pointer text-green-500 hover:text-green-600"
             @click="emits('addToSelectList', row.original)"
      />
    </template>
    <template #actionsVariant="{row}">
      <X v-if="checkVariants(row.original)"
         class="cursor-pointer  hover:text-red-600 text-red-500"
         @click="emits('removeToSelectListVariant', row.original);"
      />
      <Check v-else
             class="cursor-pointer text-green-500 hover:text-green-600"
             @click="emits('addToSelectListVariant', row)"
      />
    </template>


  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {h, PropType} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import usePermission from "@/composables/usePermission";
import {Product} from "@/models/Product";
import {X, Check, ChevronDown, ChevronRight} from "lucide-vue-next"


const emits = defineEmits(["addToSelectList", "removeToSelectList", "addToSelectListVariant", "removeToSelectListVariant"]);

const props = defineProps({
  items: {
    type: Array as PropType<Product[]>,
    default: () => []
  },

  selectedList: {
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
    default: false
  }

});


const columns = [

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
    accessorKey: "name",
    header: "Название",
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

  {
    accessorKey: "barcode",
    header: "Штрих-код",
  },
  {
    accessorKey: "code",
    header: "Код",
  },


  {
    accessorKey: "description",
    header: "Описание",
  },

];


const checkVariants = (productVariant: Product) => {

  const findParentProduct = props.selectedList.find(p => p.id === productVariant.product_id);

  return findParentProduct?.variants.some(p => p.id === productVariant.id);

}


</script>

<style scoped></style>
