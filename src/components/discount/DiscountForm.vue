<template>
  <Loader v-if="isLoading"/>
  <DynamicForm
      v-else
      v-model="props.formData"
      :key="renderForm"
      :fields="formFields"
      :errors="errors"
      :show-submit-button="true"
      :submit-button-text="submitButtonName"
      @submit-form="handleSubmit"
  />
</template>

<script setup lang="ts">
import {ref, onMounted, watch, computed} from 'vue'
import DynamicForm from '@/components/dynamics/DynamicForm.vue'
import {useCategoryFunctions} from "@/composables/useCategoryFunctions";
import {useProductFunctions} from "@/composables/useProductFunctions";
import {Product} from "@/models/Product";
import {DiscountTargetOptions, DiscountTargetType, DiscountValueOptions} from "@/constants/DiscountType";
import {Discount} from "@/models/Discount";
import {Category} from "@/models/Category";
import Loader from "@/components/common/Loader.vue";


const props = defineProps({
  formData: {
    type: Discount,
    required: true,
  },
  submitButtonName: {
    type: String,
    default: 'Создать'
  }
})

const emit = defineEmits(['submitForm'])

const renderForm = ref(1)
const isLoading = ref<boolean>(true)
const errors = ref<Record<string, string>>({})
const formFields = ref<any[]>([])


const categories = ref<Category[]>([])
const products = ref<Product[]>([])

const {getCategories} = useCategoryFunctions()
const {getProducts} = useProductFunctions()


onMounted(async () => {

  await loadOptions()

  buildFormFields();
  isLoading.value = false;
});


const handleSubmit = () => {
  if (props.formData.is_unlimited) {
    props.formData.endsAt = null;
  }
  emit('submitForm');
}

watch(
    () => props.formData?.discountType,
    async (newValue) => {

      if (props.formData) {
        if (newValue != DiscountTargetType.SPECIFIC) {
          props.formData.productIds = undefined
        }
        if (newValue != DiscountTargetType.CATEGORY) {
          props.formData.categoryIds = undefined
        }
      }

      await loadOptions()
      buildFormFields();
    }
);
watch(
    () => props.formData.is_unlimited,
    () => buildFormFields()
)

const buildFormFields = () => {
  formFields.value = [

    [
      {
        name: 'isActive',
        component: 'checkbox',
        label: 'Активна',
      },
      {
        name: 'is_unlimited',
        component: 'checkbox',
        label: 'Действует бессрочно',
        description: 'Скидка будет активна без даты окончания',
      },
    ],

    {
      name: 'name',
      component: 'text',
      type: 'text',
      label: 'Название',
      required: true,
      placeholder: 'Введите название'
    },

    [
      {
        name: 'type',
        component: 'select',
        label: 'Тип скидки',
        required: true,
        placeholder: 'Введите название',
        options: DiscountValueOptions,
        optionLabel: 'label',
        optionValue: 'value'
      },
      {
        name: 'value',
        component: 'text',
        type: 'number',
        label: 'Значение',
        required: true,
        placeholder: 'Введите...'
      },
    ],
    [
      {
        name: 'startsAt',
        component: 'date',
        label: 'Дата начала',
        placeholder: '',
      },


      ...(props.formData.is_unlimited
              ? []
              : [
                {
                  name: 'endsAt',
                  component: 'date',
                  label: 'Дата окончания',
                  placeholder: 'Выберите дату окончания',
                  required: false,
                  description: 'Если бессрочно — включите галочку выше',
                },
              ]
      )
    ],


    [


      {
        name: 'discountType',
        component: 'select',
        label: 'Применять',
        required: true,
        placeholder: 'Введите название',
        options: DiscountTargetOptions,
        optionLabel: 'label',
        optionValue: 'value'
      },

      ...(props.formData?.discountType == DiscountTargetType.SPECIFIC
          ? [
            {
              name: 'productIds',
              component: 'multiSelect',
              label: 'Товары',
              required: true,
              placeholder: 'Выберите продукты',
              options: products.value,
              optionLabel: 'name',
              optionValue: 'id'
            }
          ]
          : []),


      ...(props.formData?.discountType == DiscountTargetType.CATEGORY
          ? [
            {
              name: 'categoryIds', // исправлено
              component: 'multiSelect',
              label: 'Категории',
              required: true,
              placeholder: 'Выберите категории', // исправлено
              options: categories.value,
              optionLabel: 'name',
              optionValue: 'id'
            }

          ]
          : []),


    ]


  ]
}

async function loadOptions() {
  const type = props.formData?.discountType

  switch (type) {
    case DiscountTargetType.ALL:
      break
    case DiscountTargetType.CATEGORY:
      if (!categories.value.length) {
        categories.value = await getCategories({get_children: false})
      }
      break
    case DiscountTargetType.SPECIFIC:
      if (!products.value.length) {
        products.value = await getProducts({per_page: 200, paginate: false})
            .then(res => res.map((item: any) => Product.fromJSON(item)))
      }
      break
    default:
      break
  }
}

</script>