<template>
  <Loader v-if="loading"/>
  <DynamicForm
      v-else
      v-model="props.formData"
      :fields="formFields"
      :show-submit-button="true"
      :submit-button-text="submitButtonName"
      @submit-form="emit('submitForm')"
  >
    <template #enyComponentSlot>
      <div class="space-y-2 w-full">
        <label class="text-sm font-medium">Товары</label>

        <div class="flex items-center justify-between gap-2">
          <CategoryProductSelectModal
              :selected-ids="selectedProductIds"
              @update:selected-ids="selectedProductIds = $event"
          />
          <span class="text-sm text-gray-500">
            Выбрано товаров: <strong>{{ selectedProductIds.length }}</strong>
          </span>
        </div>

        <div
            v-if="selectedProducts.length === 0"
            class="text-sm text-gray-400 italic"
        >
          Товары не выбраны
        </div>

        <div v-else class="mt-2 max-h-72 space-y-2 overflow-y-auto pr-1">
          <div
              v-for="product in selectedProducts"
              :key="product.id"
              class="flex items-center justify-between gap-3 rounded border p-2"
          >
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-medium">{{ product.name }}</span>
                <span class="text-sm text-gray-500">(ID: {{ product.id }})</span>
                <span
                    v-if="isProductOutOfStock(product)"
                    class="inline-flex items-center rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 whitespace-nowrap"
                >
                  Нет в наличии
                </span>
              </div>
            </div>

            <Button
                variant="ghost"
                size="sm"
                type="button"
                @click="removeProduct(product.id)"
            >
              <X class="h-4 w-4"/>
            </Button>
          </div>
        </div>
      </div>
    </template>
  </DynamicForm>
</template>

<script setup lang="ts">
import {computed, ref, onMounted} from 'vue'
import DynamicForm from '@/components/dynamics/DynamicForm.vue'
import {FormDynamicFieldType} from "@/types/form";
import {useCategoryFunctions} from "@/composables/useCategoryFunctions";
import {useProductFunctions} from "@/composables/useProductFunctions";
import {Product} from "@/models/Product";
import Loader from "@/components/common/Loader.vue";
import {Category, CategoryFormData} from "@/types/category";
import {isProductOutOfStock} from "@/utils/productStock";
import CategoryProductSelectModal from "@/components/category/product_select/CategoryProductSelectModal.vue";
import {Button} from "@/components/ui/button";
import {X} from "lucide-vue-next";


interface Props {
  formData: CategoryFormData,
  submitButtonName: string,
}

const props = withDefaults(defineProps<Props>(), {
  submitButtonName: 'Создать'
})

const loading = ref(true)

const emit = defineEmits(['submitForm'])

const {getCategories} = useCategoryFunctions()
const {getProducts} = useProductFunctions()

const categories = ref<Category[]>([])
const products = ref<Product[]>([])

const formFields = ref<FormDynamicFieldType[]>([])


onMounted(async () => {
  try {
    const categoryResponse = await getCategories({
      get_children: false,
      per_page: 100,
    })
    categories.value = categoryResponse?.data ?? []

    // Для выбора товаров достаточно локальных остатков из БД. admin=true
    // вызывает синхронный запрос к МойСклад и из-за его timeout'а зависала
    // вся форма редактирования категории.
    const productResponse = await getProducts({
      per_page: 1000,
      paginate: false,
      admin: false,
      is_active: 1,
      sort_by: 'display_order',
      sort_order: 'asc',
    })
    const rawProducts = Array.isArray(productResponse)
        ? productResponse
        : productResponse?.data ?? []
    products.value = rawProducts.map((item: any) => Product.fromJSON(item))

    formFields.value = await getColumns()
  } finally {
    // Ошибка одного из справочников не должна оставлять модалку в прелоаде.
    loading.value = false
  }
})

const selectedProductIds = computed<number[]>({
  get: () => (props.formData.product_ids ?? [])
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id)),
  set: (ids) => {
    props.formData.product_ids = Array.from(new Set(ids.map((id) => Number(id))));
  },
})

const selectedProducts = computed(() => {
  return selectedProductIds.value
      .map((id) => products.value.find((product) => product.id === id))
      .filter((product): product is Product => Boolean(product));
})

const removeProduct = (productId: number | null) => {
  if (!productId) return;
  selectedProductIds.value = selectedProductIds.value.filter((id) => id !== productId);
}

const getColumns = async () => {
  return [
    {
      name: 'name',
      component: 'text',
      type: 'text',
      label: 'Название',
      required: true,
      placeholder: 'Введите название'
    },
    {
      name: 'parent_id',
      component: 'select',
      label: 'Родительская категория',
      required: false,
      placeholder: 'Выберите категорию',
      options: categories.value ?? [],
      optionLabel: 'name',
      optionValue: 'id'
    },
    {
      name: 'product_ids',
      component: 'enyComponentSlot',
      label: 'Товары',
      required: false,
    },
    {
      name: 'description',
      component: 'textarea',
      label: 'Описание',
      required: false,
      placeholder: 'Введите описание',
      rows: 3
    },
    // НОВЫЕ ПОЛЯ
    {
      name: 'show_in_catalog_menu',
      component: 'checkbox',
      label: 'Показывать в меню каталога',
      required: false,
    },
    {
      name: 'show_as_home_banner',
      component: 'checkbox',
      label: 'Показывать баннером на главной',
      required: false,
    },
    {
      name: 'is_new_product',
      component: 'checkbox',
      label: 'Автоматически добавлять новинки',
      required: false,
    },
    {
      name: 'is_coming_soon',
      component: 'checkbox',
      label: 'Скоро в продаже (показывать выбранные товары без остатка)',
      required: false,
    },
    {
      name: 'menu_order',
      component: 'text',
      type: 'number',
      label: 'Порядок отображения',
      required: false,
      placeholder: '0'
    },
    // {
    //   name: 'banner_image',
    //   component: 'text',
    //   type: 'file',
    //   label: 'Изображение баннера',
    //   required: false,
    //   accept: 'image/*',
    //   cropperShow: true,
    //   cropperAspectRatio: 16 / 9,
    // }


    {
      name: 'banner_image_desktop',
      component: 'text',
      type: 'file',
      label: 'Баннер (Desktop)',
      required: false,
      accept: 'image/*',
      cropperShow: true,
      // cropperAspectRatio: 3 / 2, // 600×400
      cropperAspectRatio: 3 / 4, // 750×1000

    },
    {
      name: 'banner_image_mobile',
      component: 'text',
      type: 'file',
      label: 'Баннер (Mobile)',
      required: false,
      accept: 'image/*',
      cropperShow: true,
      // cropperAspectRatio: 3 / 4, // 750×1000
      cropperAspectRatio: 3 / 2, // 600×400

    },


  ]
}

</script>
