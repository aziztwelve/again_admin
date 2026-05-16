<template>
  <!--  {{items}}-->
  <DynamicsDataTable
      :data="items"
      :columns="columns"
      :custom-actions="true"
  >
    <template #actions="{row}">

      <DiscountEditModal
          :key="row.original.id"
          :discount="row.original"
          @update="emits('updated')"
      />

      <IconButtons
          :buttons="[
              { type: 'delete', onClick: deleteDiscountHandle }
              ]"
          :context="row.original"
      />

    </template>


  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {h, PropType, ref} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import usePermission from "@/composables/usePermission";
import {Category} from "@/models/Category";
import {Check, X} from 'lucide-vue-next'
import IconButtons from "@/components/dynamics/IconButtons.vue";
import {useCategoryFunctions} from "@/composables/useCategoryFunctions";
import {Product} from "@/models/Product";
import {Discount} from "@/models/Discount";
import {useDateFormat} from "@/composables/useDateFormat";
import DiscountEditModal from "@/components/discount/DiscountEditModal.vue";
import {useDiscountFunctions} from "@/composables/useDiscountFunctions";


const props = defineProps({
  items: {
    type: Array as PropType<Discount[]>,
    default: []
  },
  loading: Boolean,
});

const emits = defineEmits(["deleted", "updated"]);

const products = ref<Product[]>([]);

const {getProductsByCategory} = useCategoryFunctions()

const {deleteDiscount} = useDiscountFunctions()


const deleteDiscountHandle = async (discount: Discount) => {
  if (discount.id) {
    const success = await deleteDiscount(discount.id)
    if (success) {
      emits('deleted', discount)
    }
  }
};


const columns = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Название",
  },
  {
    accessorKey: "typeLabel",
    header: "Тип",
  },
  {
    accessorKey: "formattedValue",
    header: "Значение",
  },
  {
    accessorKey: "discountTypeLabel",
    header: "Применение",
  },
  // {
  //   accessorKey: "priority",
  //   header: "Приоритет",
  // },
  {
    accessorKey: "startsAt",
    header: "Начало действия",
    cell: ({row}: any) => formatDateToRussian(row.original.startsAt)
  },
  {
    accessorKey: "endsAt",
    header: "Окончание",
    cell: ({row}: any) => formatDateToRussian(row.original.endsAt)
  },


  {
    accessorKey: "isActive",
    header: "Активна",
    cell: ({row}: any) => {
      return row.original.isActive
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },
  {
    accessorKey: "is_unlimited",
    header: "Без бессрочный",
    cell: ({row}: any) => {
      return row.original.is_unlimited
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },
];

const {hasPermission} = usePermission()

const getProducts = async (item: Category) => {
  if (item.id) {
    products.value = await getProductsByCategory({category_id: item.id})
        .then(res => {
          return res.products.map((product: Product) => Product.fromJSON(product));
        })
  }
}


const {formatDateToRussian} = useDateFormat()
</script>

<style scoped></style>
