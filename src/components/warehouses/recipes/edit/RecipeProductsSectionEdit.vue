<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <div>
        <Label class="text-sm font-medium">Выходные продукты</Label>
        <p class="text-xs text-muted-foreground">Продукты по техкарте</p>
      </div>
      <Button
          type="button"
          variant="outline"
          size="sm"
          @click="addProduct"
          :disabled="availableProducts?.length === 0"
          class="h-8 text-xs"
      >
        <PlusIcon class="h-3 w-3 mr-1"/>
<!--        Добавить-->
      </Button>
    </div>

    <div v-if="modelValue.output_products?.length === 0" class="rounded-lg border border-dashed p-4 text-center">
      <PackagePlusIcon class="mx-auto h-5 w-5 text-muted-foreground"/>
      <h3 class="mt-1 text-xs font-medium">Нет продуктов</h3>
      <p class="mt-1 text-xs text-muted-foreground">Добавьте получаемые продукты</p>
    </div>

    <div v-else class="space-y-2">
<!--      {{modelValue.output_products}}-->
      <div
          v-for="(product, index) in modelValue.output_products"
          :key="product.component_id + '-' + index"
          class="grid grid-cols-1 gap-2 border p-3 rounded-lg bg-background hover:bg-accent/50 transition-colors"
      >
        <div class="grid md:grid-cols-12 grid-cols-1 gap-3 items-end">
          <!-- Product Selection -->
          <div class="md:col-span-5">
            <DynamicDropdownSelect
                v-model="product.component_id"
                :options="availableProducts"
                title="Продукт"
                option-value="id"
                option-label="name"
                :disabled="false"
                @update:modelValue="() => onProductChange(product)"
                class="w-full"
            />
          </div>

          <!-- Variant Selection -->
          <div class="md:col-span-4">
            <DynamicDropdownSelect
                v-model="product.variant_id"
                :options="getProductVariants(product.component_id)"
                title="Вариант"
                option-value="id"
                option-label="name"
                :disabled="!product.component_id || !hasVariants(product.component_id)"
                class="w-full"
            >
            </DynamicDropdownSelect>
          </div>

          <!-- Quantity -->
          <div class="md:col-span-2">
            <Label class="text-xs">Кол-во</Label>
            <Input
                v-model.number="product.qty"
                type="number"
                min="1"
                step="1"
                class="h-8 text-xs w-full"
            />
          </div>

          <!-- Remove Button -->
          <div class="md:col-span-1 flex justify-end">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                class="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                @click="removeProduct(index)"
            >
              <Trash2Icon class="h-3.5 w-3.5"/>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {PlusIcon, PackagePlusIcon, Trash2Icon} from 'lucide-vue-next'
import {Label} from "@/components/ui/label"
import DynamicDropdownSelect from "@/components/dynamics/Dropdown/Select.vue"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {CreateRecipe} from "@/models/CreateRecipe"
import {onMounted} from "vue";

const props = defineProps({
  modelValue: {type: CreateRecipe, required: true},
  availableProducts: {type: Array, required: true},
  isLoading: Boolean,
  errors: Object
})

const emit = defineEmits(['update:modelValue'])

// Filter products to exclude already added ones (except current index)
const filteredAvailableProducts = (currentIndex) => {
  return props.availableProducts?.filter(product =>
      !props.modelValue?.output_products.some((p, i) =>
          p.component_id === product.id && i !== currentIndex
      )
  )
}

const addProduct = () => {
  const availableProduct = props.availableProducts?.find(
      p => !props.modelValue?.output_products.some(added => added.component_id === p.id)
  )

  if (availableProduct) {
    const newProducts = [
      ...props.modelValue?.output_products,
      {
        component_type: 'Product',
        component_id: availableProduct.id,
        variant_id: null,
        qty: 1,
        is_default: props.modelValue?.output_products.length === 0
      }
    ]

    emit('update:modelValue', {
      ...props.modelValue,
      output_products: newProducts
    })
  }
}

const removeProduct = (index) => {
  const newProducts = [...props.modelValue?.output_products]
  const wasDefault = newProducts[index].is_default
  newProducts.splice(index, 1)

  // Set first product as default if we removed the default one
  if (wasDefault && newProducts.length > 0) {
    newProducts[0].is_default = true
  }

  emit('update:modelValue', {
    ...props.modelValue,
    output_products: newProducts
  })
}

const onProductChange = (product) => {
  // Reset variant when product changes
  product.variant_id = null
}

const hasVariants = (productId) => {
  const product = props.availableProducts?.find(p => p.id === productId)
  return product?.has_variants && product.variants?.length > 0
}

const getProductVariants = (productId) => {
  const product = props.availableProducts?.find(p => p.id === productId)
  if (!product) return []

  const variants = product.variants || []
  // Add "no variant" option if product has variants but we allow no variant selection
  if (variants.length > 0) {
    return [...variants, {id: null, name: 'Без вариантов', price: 0}]
  }
  return variants
}



onMounted(() => {
  console.log(props.modelValue)
})
</script>