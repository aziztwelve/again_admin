<template>
  <div class="space-y-5 font-medium text-sm">

    <div class="border-b py-3 pl-1 text-sm text-gray-800">Варианты товара</div>

    <div class="text-gray-300 p-2">
      Варианты товара - это отдельные товарные позиции, которые отличаются по одной или нескольким значениям свойств
      вариантов. Например, футболка размера S может быть вариантом товара футболка
    </div>
    <Drawer>
      <DrawerTrigger class="text-blue-300">Добавить</DrawerTrigger>

      <div class="text-gray-700 w-full ">
        <DrawerContent>
          <div class="w-full flex flex-col justify-center items-center">
            <DrawerHeader>
              <DrawerTitle>Добавление вариантов</DrawerTitle>
              <DrawerDescription>

                <SelectBox
                    :data="units"
                    option-label="name"
                    @selectedValue="console.log($event)"
                />

                <div class="w-full">
                  <div class="grid w-full items-center gap-2 p-2">
                    <Label for="name">Наименование*</Label>
                    <Input
                        id="name"
                        type="text"
                        required
                        placeholder="Наименование"
                    />
                  </div>

                </div>
              </DrawerDescription>
            </DrawerHeader>

            <DrawerFooter>
              <div class="flex">
                <Button class="bg-blue-500 hover:bg-blue-600 mr-2">Добавить</Button>
                <DrawerClose>
                  <Button>Отменить</Button>
                </DrawerClose>
              </div>
            </DrawerFooter>

          </div>
        </DrawerContent>
      </div>

    </Drawer>

  </div>
</template>

<script setup lang="ts">
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import SelectBox from "@/components/SelectBox.vue";
import axios from "axios";
import {ref} from "vue";


const units = ref()

const fetchUnits = async () => {
  axios.get('units').then(res => {
    units.value = res.data
  })
}

fetchUnits()

</script>
