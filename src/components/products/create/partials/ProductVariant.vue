<template>
  <div class="font-medium text-sm">

    <div class="border-b py-3 pl-1 text-sm text-gray-800">Варианты товара</div>

    <div class="text-gray-300 p-2">
      Варианты товара - это отдельные товарные позиции, которые отличаются по одной или нескольким значениям свойств
      вариантов. Например, футболка размера S может быть вариантом товара футболка
    </div>


    <Drawer v-model:open="open">
      <DrawerTrigger class="w-full flex justify-start">
        <Button type="button" variant="outline">Посмотреть</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div class="h-[80vh] overflow-y-auto p-2">

          <div class="flex w-full justify-between items-center mb-2">

            <span class="font-medium text-gray-600">Варианты товара</span>

            <Button variant="outline"
                    @click="product.variants?.push(Product.fromJSONForVariantCreate({})); renderTable++">
              <Plus/>
              Новый вариант
            </Button>
          </div>

          <div class="flex flex-col justify-between items-end">
            <ProductVariantTable
                class="w-full"
                :key="renderTable"
                :product="product"
                @deleted="renderTable++"
            />

            <Button v-if="product.variants?.length"
                    @click="open = false"
                    class="mt-2"
            >
              Добавить
            </Button>
          </div>

        </div>
      </DrawerContent>

    </Drawer>

  </div>
</template>

<script setup lang="ts">
import {Plus, ArrowDown} from 'lucide-vue-next'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {Button} from "@/components/ui/button";
import {ref, watch} from "vue";
import {Product} from "@/models/Product";
import ProductVariantTable from "@/components/products/create/ProductVariantTable.vue";


const open = ref(false);

const props = defineProps({
  product: {
    type: Product,
    required: true,
  }
})

const emits = defineEmits(['finishUpdated']);

const renderTable = ref(1)


</script>
