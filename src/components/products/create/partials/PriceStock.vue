<template>
  <div class="space-y-5 font-medium">

<!--    <div class="border-b py-3 pl-1 text-sm">-->
<!--      Цены -->
<!--    </div>-->

<!--    <h6 class="text-gray-800 text-sm">Цены</h6>-->

    <div class="grid md:grid-cols-2 grid-cols-1 w-full gap-2">
      <div class="w-full ">
        <label class="block text-sm font-medium text-gray-700 mb-2">Цена*</label>
        <NumberField
            class="gap-2"
            :min="10"
            :format-options="{
          style: 'currency',
          currency: 'RUB',
          currencyDisplay: 'code',
          currencySign: 'accounting',
        }"
            v-model="product.price"
        >
          <NumberFieldContent>
            <NumberFieldDecrement/>
            <NumberFieldInput/>
            <NumberFieldIncrement/>
          </NumberFieldContent>
        </NumberField>
      </div>
<!--      <div class="w-full md:px-2 md:py-0 py-2">-->
<!--        <label class="block text-sm font-medium text-gray-700 mb-2">Цена до скидки</label>-->
<!--        <NumberField-->
<!--            class="gap-2"-->
<!--            :min="0"-->
<!--            :max="30000"-->
<!--            :format-options="{-->
<!--          style: 'currency',-->
<!--          currency: 'RUB',-->
<!--          currencyDisplay: 'code',-->
<!--          currencySign: 'accounting',-->
<!--        }"-->
<!--            v-model="product.old_price"-->
<!--        >-->
<!--          <NumberFieldContent>-->
<!--            <NumberFieldDecrement/>-->
<!--            <NumberFieldInput/>-->
<!--            <NumberFieldIncrement/>-->
<!--          </NumberFieldContent>-->
<!--        </NumberField>-->
<!--      </div>-->
      <div class="w-full">
        <label class="block text-sm font-medium text-gray-700 mb-2">Цена закупкы</label>
        <NumberField
            class="gap-2"
            :min="0"

            :format-options="{
          style: 'currency',
          currency: 'RUB',
          currencyDisplay: 'code',
          currencySign: 'accounting',
        }"
            v-model="product.cost_price"
        >
          <NumberFieldContent>
            <NumberFieldDecrement/>
            <NumberFieldInput/>
            <NumberFieldIncrement/>
          </NumberFieldContent>
        </NumberField>
      </div>
    </div>

    <!--    <div class="w-full">-->
    <!--      <label class="block text-sm font-medium text-gray-700 mb-2">Остатки</label>-->
    <!--      <NumberField-->
    <!--          class="gap-2 max-w-lg"-->
    <!--          :min="0"-->
    <!--          :max="30000"-->
    <!--          v-model="product.stock_quantity"-->
    <!--      >-->
    <!--        <NumberFieldContent>-->
    <!--          <NumberFieldDecrement />-->
    <!--          <NumberFieldInput />-->
    <!--          <NumberFieldIncrement />-->
    <!--        </NumberFieldContent>-->
    <!--      </NumberField>-->
    <!--    </div>-->
  </div>
</template>

<script setup lang="ts">
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'
import {Product} from '@/models/Product';

// const product = defineModel<Product>('product');


const props = defineProps({
  product: {
    type: Product,
    required: true,
  }
})

</script>