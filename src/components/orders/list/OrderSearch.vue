<template>
  <div class="w-full flex flex-col gap-2">
    <DynamicsFilter
        :columns="topColumns"
        :filter="filter"
        :show-button="false"
        @search="emits('search')"
    />
    <DynamicsFilter
        :columns="bottomColumns"
        :filter="filter"
        @search="emits('search')"
    />
  </div>
</template>

<script setup>
import {computed} from 'vue';
import DynamicsFilter from '@/components/dynamics/Filter/Index.vue';
import {useStatusFunctions} from "@/composables/useStatusFunctions";

const props = defineProps({
  filter: Object,
  // Опции селектов прокидываются из родителя (OrdersList), чтобы те же
  // самые списки использовались и в фильтрах-кнопках в заголовках таблицы.
  managerOptions: {
    type: Array,
    default: () => [],
  },
  deliveryMethodOptions: {
    type: Array,
    default: () => [],
  },
});

const emits = defineEmits(["search"]);


const {getStatuses} = useStatusFunctions()


const topColumns = computed(() => [
  {
    type: "select",
    placeholder: "Статус заказа",
    field: "status",
    options: getStatuses('order'),
    optionValue: 'value',
    optionLabel: 'label',
  },
  {
    type: "select",
    placeholder: "Статус платежа",
    field: "payment_status",
    options: getStatuses('payment'),
    optionValue: 'value',
    optionLabel: 'label',
  },
  {
    type: "select",
    placeholder: "Способ доставки",
    field: "delivery_method_id",
    options: props.deliveryMethodOptions,
    optionValue: 'value',
    optionLabel: 'label',
  },
  {
    type: "select",
    placeholder: "Менеджер",
    field: "assigned_user_id",
    options: props.managerOptions,
    optionValue: 'value',
    optionLabel: 'label',
  },

  {
    type: "date_range",
    placeholder: "Выберите период",
    field: "datePicker",
  },

]);

const bottomColumns = [
  {
    type: "text",
    placeholder: "№ заказа, ФИО, email, телефон, страна, город, адрес",
    field: "search",
  },
];

</script>

<style scoped></style>
