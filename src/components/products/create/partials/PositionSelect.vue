<template>
  <Accordion type="single" collapsible default-value="item-1">
    <AccordionItem value="item-1">
      <AccordionTrigger>
        <span class="pl-1 text-sm">Расположение</span>
      </AccordionTrigger>
      <AccordionContent>
        <div class="text-gray-600 w-full px-2 ">
          <div class="flex items-center space-x-2 w-full justify-between">
            <span>На сайте</span>

            <div class="flex items-center space-x-3">
            <Switch id="airplane-mode"  v-model="product.is_active"/>
            <Label for="airplane-mode">Показать</Label>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>

<script setup lang="ts">
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {Product} from "@/models/Product";

const product = defineModel<Product>('product')

</script>

<style scoped>

</style>