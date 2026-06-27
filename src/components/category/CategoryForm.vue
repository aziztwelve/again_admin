<template>
  <Loader v-if="loading"/>
  <DynamicForm
      v-else
      v-model="props.formData"
      :fields="formFields"
      :show-submit-button="true"
      :submit-button-text="submitButtonName"
      @submit-form="emit('submitForm')"
  />
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import DynamicForm from '@/components/dynamics/DynamicForm.vue'
import {FormDynamicFieldType} from "@/types/form";
import {useCategoryFunctions} from "@/composables/useCategoryFunctions";
import {useProductFunctions} from "@/composables/useProductFunctions";
import {Product} from "@/models/Product";
import Loader from "@/components/common/Loader.vue";
import {Category, CategoryFormData} from "@/types/category";


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

  await getCategories({
    get_children: false,
    per_page: 100
  })
      .then(res => {
        categories.value = res.data
      })

  products.value =
      await getProducts({per_page: 200, paginate: false})
          .then(response => {
            return response.map((item: any) => Product.fromJSON(item))
          })


  formFields.value = await getColumns()

  loading.value = false

})


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
      component: 'multiSelect',
      label: 'Товары',
      required: false,
      placeholder: 'Выберите товары',
      options: products.value ?? [],
      optionLabel: 'name',
      optionValue: 'id'
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
      label: 'Скоро в продаже (автоматически добавлять товары без остатка)',
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