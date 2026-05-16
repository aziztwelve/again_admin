<template>
  <DynamicsDataTable
      :data="items"
      :columns="columns"
      :custom-actions="true"
      :loading="loading"
      :pagination="pagination"
      sub-rows-field="children"
  >
    <template #actions="{row}">

      <ProductShowModal
          :products="products"
          @dialog-open="getProducts(row.original)"
      />

      <CategoryEditModal
          :item="row.original"
          @updated="emits('updated', $event)"
      />

      <IconButtons
          :buttons="[
              { type: 'delete', onClick: deleteCategoryHandle }
              ]"
          :context="row.original"
      />

    </template>

    <template #actionsVariant="{row}">

      <ProductShowModal
          :products="products"
          @dialog-open="getProducts(row.original)"
      />

      <CategoryEditModal
          :item="row.original"
          @updated="emits('updated', $event)"
      />

      <IconButtons
          :buttons="[
              { type: 'delete', onClick: deleteCategoryHandle }
              ]"
          :context="row.original"
      />

    </template>

  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {h, ref} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {ChevronRight, ChevronDown, Check, X} from 'lucide-vue-next'
import IconButtons from "@/components/dynamics/IconButtons.vue";
import CategoryEditModal from "@/components/category/CategoryEditModal.vue";
import {useCategoryFunctions} from "@/composables/useCategoryFunctions";
import ProductShowModal from "@/components/products/ProductShowModal.vue";
import {Product} from "@/models/Product";
import {PaginationMeta} from "@/types/Types";
import {Category} from "@/types/category";


interface Props {
  items: Category[];
  loading?: boolean;
  pagination?: PaginationMeta
}

defineProps<Props>();

const emits = defineEmits<{
  (e: 'updated', category: Category): void;
  (e: 'deleted', category: Category): void;
}>();

const products = ref<Product[]>([]);

const {deleteCategory, getProductsByCategory} = useCategoryFunctions()


const deleteCategoryHandle = (category: Category) => {
  try {
    deleteCategory(category.id)
        .then(() => emits('deleted', category))
  } catch (e) {
    console.log(e)
  }
};


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
    accessorKey: "description",
    header: "Описание",
  },


  {
    accessorKey: "show_in_catalog_menu",
    header: "В меню",
    cell: ({row}: any) => {
      return row.original.show_in_catalog_menu
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },

  {
    accessorKey: "show_as_home_banner",
    header: "Баннер",
    cell: ({row}: any) => {
      return row.original.show_as_home_banner
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },
  {
    accessorKey: "is_new_product",
    header: "Для новинки",
    cell: ({row}: any) => {
      return row.original.is_new_product
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },

  {
    accessorKey: "menu_order",
    header: "Порядок",
  },

  {
    accessorKey: "banners",
    header: "Фото",
    cell: ({ row }: any) => {
      const d = row.original.desktop_url
      const m = row.original.mobile_url

      if (!d && !m) {
        return h('span', { class: 'text-gray-400 text-sm' }, '−')
      }

      return h('div', { class: 'flex items-center gap-2' }, [
        d
            ? h('img', {
              src: d,
              alt: row.original.name,
              class: 'w-16 h-10 object-cover rounded'
            })
            : h('span', { class: 'text-gray-300 text-xs' }, 'D−'),

        m
            ? h('img', {
              src: m,
              alt: row.original.name,
              class: 'w-10 h-16 object-cover rounded'
            })
            : h('span', { class: 'text-gray-300 text-xs' }, 'M−'),
      ])
    }
  },

];

const getProducts = async (item: Category) => {
  products.value = await getProductsByCategory({category_id: item.id})
      .then(res => {
        return res.products.map((product: any) => Product.fromJSON(product));
      })
}

</script>

<style scoped></style>
