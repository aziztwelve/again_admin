<template>
  <Accordion type="single" collapsible default-value="item-1">
    <AccordionItem value="item-1">
      <AccordionTrigger>
        <span class="pl-1 text-sm">Артикул и габариты</span>
      </AccordionTrigger>
      <AccordionContent>

        <div class="text-gray-600">

          <div class="grid grid-cols-2 items-end">
            <div class="grid w-full items-center gap-2 p-2">
              <Label for="sku">Артикул*</Label>
              <Input
                  id="sku"
                  type="text"
                  placeholder="Артикул"
                  v-model="product.sku"
              />
            </div>
            <div class="grid w-full items-center gap-2 p-2">
              <p class="text-xs text-gray-500">Штрих-код создаётся автоматически в МойСклад</p>
              <Input
                  id="barcode"
                  type="text"
                  placeholder="Штрих-код"
                  v-model="product.barcode"
                  readonly
                  class="bg-gray-100 cursor-not-allowed"
              />
            </div>

          </div>

          <div class="grid md:grid-cols-2 grid-cols-1 mt-3">

            <!-- Вес (кг) -->
            <div class="grid w-full items-center gap-2 p-2">
              <Label class="block text-sm font-medium text-gray-700" for="barcode">Вес гр</Label>
              <Input
                  id="barcode"
                  type="text"
                  required
                  placeholder="В гр"
                  v-model="product.weight"
              />
            </div>

            <!-- Габариты -->
            <div class="grid md:grid-cols-3 grid-cols-1">

              <!-- Длина -->
              <div class="grid w-full items-center gap-2 p-2">
                <Label class="block text-sm font-medium text-gray-700" for="barcode">Длина</Label>
                <Input
                    id="barcode"
                    type="text"
                    required
                    placeholder="См"
                    v-model="product.length"
                />
              </div>

              <!-- Ширина -->
              <div class="grid w-full items-center gap-2 p-2">
                <Label class="block text-sm font-medium text-gray-700" for="barcode">Ширина</Label>
                <Input
                    id="barcode"
                    type="text"
                    required
                    placeholder="См"
                    v-model="product.width"
                />
              </div>

              <!-- Высота -->
              <div class="grid w-full items-center gap-2 p-2">
                <Label class="block text-sm font-medium text-gray-700" for="barcode">Высота</Label>
                <Input
                    id="barcode"
                    type="text"
                    required
                    placeholder="См"
                    v-model="product.height"
                />
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>

<script setup lang="ts">
import {Input} from "@/components/ui/input";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Label} from "@/components/ui/label";
import {Product} from "@/models/Product";

defineProps({
  product: {
    type: Product,
    required: true,
  }
})


</script>

<style scoped>

</style>