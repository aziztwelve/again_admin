<template>
  <DynamicsFilter
      :columns="filterColumns"
      :filter="filter"
      @search="emits('search')"
  />

</template>

<script setup>
import {ref, onMounted} from 'vue';
import DynamicsFilter from '@/components/dynamics/Filter/Index.vue';
import Button from '@/components/ui/button/Button.vue';
import {useStatusFunctions} from "@/composables/useStatusFunctions";

const props = defineProps({
  filter: Object,
});

const emits = defineEmits(["search"]);


const {getStatuses} = useStatusFunctions()

const filterColumns = ref([


  {
    type: "text",
    placeholder: "Имя / Email / Телефон",
    field: "search",
  },

  {
    type: "select",
    placeholder: "Статус заказа",
    field: "status",
    options: getStatuses('contactRequest'),
    optionValue: 'value',
    optionLabel: 'label',
  },

  {
    type: "date_range",
    placeholder: "Выберите период",
    field: "datePicker",
  },


]);


</script>

<style scoped></style>
