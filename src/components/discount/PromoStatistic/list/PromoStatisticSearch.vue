<template>
  <div class="flex">
    <DynamicsFilter
        :columns="filterColumns"
        :filter="filter"
        @search="emits('search')"
    />
    <div class="ml-2"
         v-if="hasFilter"
    >
      <Button variant="outline" size="sm"
              @click="restartFilter"
      >
        <X/>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import DynamicsFilter from '@/components/dynamics/Filter/Index.vue';
import Button from '@/components/ui/button/Button.vue';
import {X} from "lucide-vue-next"
import {useStatusFunctions} from "@/composables/useStatusFunctions";

const props = defineProps({
  filter: Object,
});

const emits = defineEmits(["search"]);


const {getStatuses} = useStatusFunctions()

const filterColumns = ref([
  {
    type: "date_range",
    placeholder: "Выберите период",
    field: "datePicker",
  },
  {
    type: "select",
    placeholder: "Статус заказа",
    field: "order_status",
    options: getStatuses('order'),
    optionValue: 'value',
    optionLabel: 'label',
  },
  {
    type: "select",
    placeholder: "Статус оплаты",
    field: "payment_status",
    options: getStatuses('payment'),
    optionValue: 'value',
    optionLabel: 'label',
  },

  {
    type: "text",
    placeholder: "Поиск по email клиента",
    field: "client_email",
  },

]);

const hasFilter = computed(() => {
  return !!props.filter.order_status || !!props.filter.payment_status || !!props.filter.client_email || !!props.filter.datePicker.start || !!props.filter.datePicker.end;
})

const restartFilter = () => {
  Object.keys(props.filter)
      .forEach((key) => {
        if (key === 'datePicker') {
          props.filter[key].start = '';
          props.filter[key].end = '';
        } else {
          props.filter[key] = ''
        }
      })
  emits('search')
}

</script>

<style scoped></style>
