<template>
  <ModalDialog>
    <template #trigger>
      <!--      <loader v-if="loading"/>-->
      <div class="relative group inline-block">
        <div
            class="flex items-center text-sky-600 text-sm cursor-pointer pb-1 border-b border-dashed border-gray-300 group-hover:border-sky-400 transition-colors duration-200">
          {{ getColorById(item?.color_id ?? '') ?? 'Выберите цвет' }}
          <svg class="ml-1 w-4 h-4 opacity-0 group-hover:opacity-70 transition-opacity" fill="none"
               stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
        </div>

      </div>

    </template>

    <template #content>


      <div class="flex flex-col space-y-2">
        <Select
            v-model="color_id_local"
            :options="props.colors || []"
            option-label="name"
            option-value="id"
            placeholder="Выберите цвет товара"
        />

        <div class="flex space-x-2">
          <!--          <Button variant="outline">Отменить</Button>-->
          <Button @click="saveColor" class="w-full">Сохранить</Button>
        </div>


      </div>

    </template>
  </ModalDialog>
</template>

<script setup lang="ts">

import ModalDialog from "@/components/dynamics/shadcn/ModalDialog.vue";
import {onMounted, PropType, ref} from "vue";
import {Color} from "@/types/Types";
import Select from "@/components/dynamics/Dropdown/Select.vue";
import {Product} from "@/models/Product";

import Button from "@/components/ui/button/Button.vue";


const props = defineProps({
  item: Product,
  colors: Array as PropType<Color[]>,
})


const emits = defineEmits(["updateColor"]);

const color_id_local = ref(props.item?.color_id ?? undefined);


const getColorById = (id: string) => {
  if (!id) return
  const color = props.colors?.find((color) => color?.id === id)
  return color?.name
}


const saveColor = () => {
  if (!props.item) return;
  props.item.color_id = color_id_local.value;
  emits("updateColor", color_id_local.value);
}


</script>


<style scoped>

</style>