<template>
  <div class="mt-2 flex ">
    <Pagination
        v-if="total > itemsPerPage"
        v-slot="{ page }"
        :items-per-page="itemsPerPage"
        :total="total"
        :sibling-count="siblingCount"
        :default-page="defaultPage"
        :show-edges="showEdges"
    >
      <PaginationList v-slot="{ items }" class="flex items-center gap-1">
        <!--      <PaginationFirst @click="$emit('currentPage', 1)"/>-->
        <PaginationPrev @click="$emit('currentPage', page - 1)"/>

        <template v-for="(item, index) in items">
          <PaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
            <Button @click="$emit('currentPage', item.value);" class="w-9 h-9 p-0"
                    :variant="item.value === page ? 'default' : 'outline'">
              {{ item.value }}
            </Button>
          </PaginationListItem>
          <PaginationEllipsis v-else :key="item.type" :index="index"/>
        </template>

        <PaginationNext @click="$emit('currentPage', page + 1)"/>
        <!--      <PaginationLast @click="$emit('currentPage', Math.ceil(total / itemsPerPage))"/>-->
      </PaginationList>
    </Pagination>


    <div class="pl-1">
      <Select
          v-if="showPerPageOption"
          :model-value="itemsPerPage.toString()"
          @update:model-value="handleItemsPerPageChange"
      >
        <SelectTrigger class="w-18 h-9">
          <SelectValue/>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
              v-for="option in itemsPerPageOptions"
              :key="option"
              :value="option.toString()"
          >
            {{ option }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Button,
} from '@/components/ui/button'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
} from '@/components/ui/pagination'

const emit = defineEmits(['currentPage', 'itemsPerPageChange'])

const props = defineProps({
  itemsPerPage: {
    type: Number,
    default: 10, // Кол-во элементов на странице
  },
  total: {
    type: Number,
    required: true, // Общее количество элементов (обязательно)
  },
  siblingCount: {
    type: Number,
    default: 1, // Кол-во соседних страниц
  },
  showEdges: {
    type: Boolean,
    default: true, // Показывать ли первую/последнюю страницы
  },
  defaultPage: {
    type: Number,
    default: 1, // Начальная страница
  },

  itemsPerPageOptions: {
    type: Array as () => number[],
    default: () => [5, 10, 15, 20, 50, 100, 150, 200],
  },

  showPerPageOption: {
    type: Boolean,
    default: false,
  }

});


const handleItemsPerPageChange = (value: string) => {
  const newItemsPerPage = parseInt(value);
  emit('itemsPerPageChange', newItemsPerPage);
  // При изменении количества элементов на странице, возвращаемся на первую страницу
  emit('currentPage', 1);
};

</script>
