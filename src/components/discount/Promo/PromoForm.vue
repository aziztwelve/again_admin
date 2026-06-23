<template>
  <DynamicForm
      v-if="!isLoading"
      v-model="props.formData"
      submit-button-text="Создать"
      :key="renderForm"
      :fields="formFields"
      :errors="errors"
      :show-submit-button="submitButtonButton"
      @emit-button="console.log(45)"
      @submit-form="handleSubmit"
  >

    <template #enyComponentSlot>
      <div class="space-y-2">
        <label class="text-sm font-medium">
          Товары (на которые действует промокод)
        </label>
        <p class="text-sm text-gray-500">
          Отметьте товары или конкретные варианты из каталога — промокод
          сработает только для них
        </p>

        <div class="flex items-center justify-between space-x-2">
          <PromoProductSelectModal
              :selected-list="selectedProducts"
              @add-products="handleAddProducts"
          />
          <span class="text-sm text-gray-500">
            Выбрано товаров: <strong>{{ selectedProducts.length }}</strong>
          </span>
        </div>

        <div
            v-if="selectedProducts.length === 0"
            class="text-sm text-gray-400 italic"
        >
          Товары не выбраны
        </div>
        <div v-else class="mt-2 space-y-2">
          <div
              v-for="product in selectedProducts"
              :key="product.id"
              class="p-2 border rounded"
          >
            <div class="flex items-center justify-between">
              <div>
                <span class="font-medium">{{ product.name }}</span>
                <span class="text-sm text-gray-500 ml-2"
                  >(ID: {{ product.id }})</span
                >
                <span
                    v-if="!product.variants || product.variants.length === 0"
                    class="ml-2 text-xs text-blue-600"
                >
                  все варианты
                </span>
              </div>
              <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  @click="removeProduct(product.id)"
              >
                Удалить
              </Button>
            </div>
            <div
                v-if="product.variants && product.variants.length > 0"
                class="mt-1 ml-2 flex flex-wrap gap-1"
            >
              <span
                  v-for="variant in product.variants"
                  :key="variant.id"
                  class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
              >
                {{ variant.name }}
                <X
                    class="w-3 h-3 cursor-pointer text-gray-500 hover:text-red-500"
                    @click="removeVariant(product.id, variant.id)"
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

  </DynamicForm>
</template>

<script setup lang="ts">
import {ref, onMounted, watch, computed} from 'vue'
import DynamicForm from '@/components/dynamics/DynamicForm.vue'
import {PromoCode} from "@/models/PromoCode";
import {DiscountTargetType, PromoCodeTargetOptions} from "@/constants/DiscountType";
import PromoProductSelectModal from "@/components/discount/Promo/promo_product/PromoProductSelectModal.vue";
import {Product} from "@/models/Product";
import {Button} from "@/components/ui/button";
import {X} from "lucide-vue-next";


const props = defineProps({
  formData: {
    type: PromoCode,
    required: true,
  },
  submitButtonButton: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submitForm', 'selectedProducts'])

const renderForm = ref(1)
const isLoading = ref<boolean>(true)
const errors = ref<Record<string, string>>({})
const formFields = ref<any[]>([])

const selectedProducts = computed<Product[]>(
    () => props.formData.selected_products ?? []
)

const handleAddProducts = (items: Product[]) => {
  if (!props.formData.selected_products) {
    props.formData.selected_products = []
  }
  const list = props.formData.selected_products

  items.forEach((incoming: any) => {
    const existing: any = list.find((p: any) => p.id === incoming.id)
    if (!existing) {
      // Новый продукт — клонируем
      list.push({
        ...incoming,
        variants: Array.isArray(incoming.variants) ? [...incoming.variants] : [],
      })
      return
    }

    // Если уже выбран и был «целиком», ничего не делаем
    if (!existing.variants || existing.variants.length === 0) return

    // Если пришёл «целиком» (variants пустые) — превращаем в «целиком»
    if (!incoming.variants || incoming.variants.length === 0) {
      existing.variants = []
      return
    }

    // Иначе мерджим варианты, избегая дубликатов
    incoming.variants.forEach((v: any) => {
      if (!existing.variants.some((ev: any) => ev.id === v.id)) {
        existing.variants.push(v)
      }
    })
  })
}

const removeProduct = (productId: number | undefined) => {
  if (!props.formData.selected_products) return
  props.formData.selected_products = props.formData.selected_products.filter(
      (p: any) => p.id !== productId
  )
}

const removeVariant = (productId: number | undefined, variantId: number | undefined) => {
  if (!props.formData.selected_products) return
  const product: any = props.formData.selected_products.find(
      (p: any) => p.id === productId
  )
  if (!product || !product.variants) return
  product.variants = product.variants.filter((v: any) => v.id !== variantId)
  // Если вариантов не осталось — убираем сам продукт из выбранных
  if (product.variants.length === 0) {
    removeProduct(productId)
  }
}

onMounted(() => {
  buildFormFields()
  isLoading.value = false
})


watch(
    () => props.formData.is_unlimited,
    (newValue) => {
      buildFormFields()
      if (newValue) {
        console.log(44)
        props.formData.expiresAt = undefined
      }
    }
)


const handleSubmit = () => {
  if (props.formData.is_unlimited) {
    props.formData.expiresAt = undefined;
  }
  emit('submitForm')
}


const buildFormFields = () => {
  formFields.value = [
    [
      {
        name: 'isActive',
        component: 'checkbox',
        label: 'Активен',
      },
      {
        name: 'applies_to_all_clients',
        component: 'checkbox',
        label: 'Применить ко всем клиентам',
      },

    ],

    [

      {
        name: 'template_type',
        component: 'checkbox',
        label: '🎂 Промокод на ДР',
      },
      {
        name: 'is_unlimited',
        component: 'checkbox',
        label: 'Действует бессрочно',
      },


    ],
    {
      name: 'discount_behavior',
      component: 'select',
      label: 'Правило совмещения скидок',
      required: true,
      options: [
        {label: 'Заменяет скидку товара', value: 'replace'},
        {label: 'Добавляется поверх существующей скидки', value: 'stack'},
        {label: 'Не применяется к товарам со скидкой', value: 'skip'}
      ],
      optionLabel: 'label',
      optionValue: 'value',
      placeholder: 'Выберите поведение',
    },

    [

      {
        name: 'code',
        component: 'text',
        type: 'text',
        label: 'Код промо',
        required: true,
        placeholder: 'Введите код промокода'
      },
      {
        name: 'maxUses',
        component: 'text',
        type: 'number',
        label: 'Максимальное количество использований',
        placeholder: 'Оставьте пустым для безлимитного',
        min: 1
      }

    ],

    [
      {
        name: 'discountAmount',
        component: 'text',
        type: 'number',
        label: 'Сумма скидки',
        required: true,
        placeholder: 'Введите сумму или %',
        min: 0
      },
      {
        name: 'discountType',
        component: 'select',
        label: 'Тип скидки',
        required: true,
        options: [
          {label: 'Процент', value: 'percentage'},
          {label: 'Фиксированная сумма', value: 'fixed'}
        ],
        optionLabel: 'label',
        optionValue: 'value',
        placeholder: 'Выберите тип'
      },

    ],
    [
      {
        name: 'startsAt',
        component: 'date',
        label: 'Дата начала'
      },

      ...(props.formData?.is_unlimited
          ? []
          : [
            {
              name: 'expiresAt',
              component: 'date',
              label: 'Дата окончания'
            },
          ])


    ],


    [

      {
        name: 'promo_code_type',
        component: 'select',
        label: 'Применять',
        required: true,
        placeholder: 'Выбрать',
        options: PromoCodeTargetOptions,
        optionLabel: 'label',
        optionValue: 'value'
      },


      ...(props.formData?.promo_code_type == DiscountTargetType.SPECIFIC
          ? [{
            name: 'enyComponentSlot',
            component: 'enyComponentSlot',
          }]
          : []),

    ],


    {
      name: 'image',
      component: 'text',
      type: 'file',
      label: 'Изображение',
      placeholder: 'Выберите файл изображения',
      accept: 'image/*',
      imagePreview: true
    }

  ]
}


watch(
    () => props.formData?.promo_code_type,
    () => {
      buildFormFields()
    }
)


</script>
