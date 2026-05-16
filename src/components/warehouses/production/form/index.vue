<template>
  <form @submit.prevent="submitForm(product, loading)" class="grid gap-3 text-gray-700">

    <Input type="text" placeholder="Название" v-model="product.name"/>

    <ProductFormPartialsBarcode
        v-model="product"
        @update:modelValue="handleBarcodeUpdate"
    />

    <Input
        type="text"
        placeholder="Код товара"
        v-model="product.code"
    />

    <!-- Категория -->
    <div class="flex md:space-x-2">
      <div class="w-full">
        <CommonCategorySelect
            :key="rendererCategory"
            v-model="product.category_id"
        />
      </div>
      <CommonCategoryAdd
          @created="
            rendererCategory++;
            product.category_id = $event.id"
      />
    </div>

    <!-- Цены -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <Label>Розничная цена</Label>
        <Input
            type="number"
            placeholder="Введите цену"
            v-model="product.price"
            min="0"
        />
      </div>
      <div>
        <Label>Оптовая цена</Label>
        <Input
            type="number"
            placeholder="Введите цену"
            v-model="product.wholesale_price"
            min="0"
        />
      </div>
    </div>

    <!-- Упаковка -->
    <div class="grid grid-cols-[auto_30%] gap-3">
      <div>
        <Label>Кол-во в упаковке</Label>
        <Input
            type="number"
            placeholder="Введите Кол-во"
            v-model="product.pack_qty"
            min="0"
        />
      </div>

      <div>
        <Label>Тип</Label>
        <CommonProductTypeSelect
            v-model="product.product_type_id"
        />
      </div>
    </div>


    <div>
      <Label class="">Кол-во упаковок в коробке</Label>
      <Input
          type="number"
          placeholder="Введите Кол-во"
          v-model="product.box_pack_qty"
          min="0"
      />
    </div>

    <div>
      <Label>Описание</Label>
      <Textarea
          placeholder="Введите описание товара"
          v-model="product.description"
      />
    </div>

    <Button type="submit" v-if="!isEdit">
      <Loader2 class="w-4 h-4 animate-spin" v-if="loading"/>
      Создать
    </Button>
  </form>
</template>

<script setup>
import {ref} from "vue"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label/index"
import {Button} from "@/components/ui/button"
import {Loader2} from "lucide-vue-next"
import {toast} from "vue-sonner"
import {Product} from "~/services/Product"
import {useProductFunctions} from "~/composables/useProductFunctions"
import {Textarea} from '@/components/ui/textarea'
import {watch} from 'vue'


const props = defineProps({
  item: Product | null,
  isEdit: {
    type: Boolean,
    default: false
  }
})

const product = ref(props.item ?? Product.fromJSON({
  barcodeLength: 3,
}))

const rendererCategory = ref(1)
const loading = ref(false)

const emits = defineEmits(["submit"])

const submitForm = async (product) => {
  if (!product.name || !product.price) {
    toast.error("Заполните все обязательные поля")
    return
  }
  try {
    loading.value = true
    product = Product.fromJSON(product)
    const result = await useProductFunctions().addProduct(product)
    if (result) {
      emits('submit')
    }

  } catch (e) {
    toast.error("Ошибка при создании продукта")
    console.error(e)
  } finally {
    loading.value = false
  }
}


// watch(() => props.item, (newItem) => {
//   if (newItem) {
//     product.value = Product.fromJSON(newItem)
//   }
// }, {deep: true})


const handleBarcodeUpdate = (updatedProduct) => {
  if (!props.item) return
  props.item.barcode = updatedProduct.barcode
  props.item.barcode_length = updatedProduct.barcode_length
}
</script>
