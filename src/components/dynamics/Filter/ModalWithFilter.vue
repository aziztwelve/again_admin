<template>
  <ModalDialog
      title="Фильтр"
      :key="renderSearchModal"
  >
    <template #trigger>
      <Button variant="outline">
        <ListFilterPlus class="ml-2"/>
        <span>Фильтр</span>
      </Button>
    </template>


    <template #content>
      <form class="py-4 h-full">
        <div class="flex gap-2 w-full max-md:flex-col flex-wrap h-full">
          <DynamicsFilterColumn
              v-for="(column, index) in columns"
              :key="index"
              :column="column"
              :filter="filter"
          />
        </div>

        <Button
            v-if="showButton"
            class="w-full mt-2"
            type="button"
            variant="secondary"
            @click="emits('search'); renderSearchModal++"
        >
          Применить
        </Button>
      </form>
    </template>

  </ModalDialog>


</template>

<script setup>
import {Button} from "@/components/ui/button";
import {ListFilterPlus} from 'lucide-vue-next';
import ModalDialog from "@/components/dynamics/shadcn/ModalDialog.vue";
import DynamicsFilterColumn from "@/components/dynamics/Filter/Column.vue";
import {ref} from "vue";

const props = defineProps({
  columns: Array,
  filter: Object,
  showButton: {
    type: Boolean,
    default: true
  }
});

const emits = defineEmits(["search"]);

const renderSearchModal = ref(1);

</script>

<style scoped></style>
