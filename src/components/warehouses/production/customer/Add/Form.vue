<template>
  <div class="space-y-6">

    <form
        @submit.prevent="submitForm(cityZoneCustomer, loading)"
        class="grid gap-3"
    >
      <!-- Выбор клиента -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Зона</label>
        <DynamicsDropdownSelect
            :options="city_zones"
            v-model="cityZoneCustomer.city_zone_id"
            option-label="zone"
            option-value="id"
            placeholder="Выберите клиента"
            required
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Клиент</label>
        <DynamicsDropdownSelect
            :options="customers"
            v-model="cityZoneCustomer.customer_id"
            option-label="name"
            option-value="id"
            placeholder="Выберите клиента"
            required
        />
      </div>

      <!-- Выбор адреса -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
        <DynamicsDropdownSelect
            :disabled="!cityZoneCustomer.customer_id"
            :options="address"
            v-model="cityZoneCustomer.customer_address_id"
            option-label="address"
            option-value="id"
            placeholder="Выберите адрес"
            required
        />
      </div>

      <Button type="submit" class="mt-4 w-full">
        <Loader2 class="w-4 h-4 animate-spin mr-2" v-if="loading"/>
        {{ loading ? 'Добавление...' : 'Добавить' }}
      </Button>
    </form>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue';
import {Button} from '@/components/ui/button';
import {Loader2} from 'lucide-vue-next';
import {toast} from 'vue-sonner';
import {useCityZoneCustomerFunctions} from '~/composables/useCityZoneCustomerFunctions';
import {CityZoneCustomer} from '~/services/CityZoneCustomer';
import {useCustomerAddressFunctions} from "~/composables/useCustomerAddressFunctions";
import {CustomerAddress} from "~/services/CustomerAddress";

const props = defineProps({
  city_zones: {
    type: Array,
    default: () => []
  },
  customers: {
    type: Array,
    default: () => []
  },
  cityZoneCustomer: {
    type: CityZoneCustomer,
  }
});

const cityZoneCustomer = ref(props.cityZoneCustomer);
const emits = defineEmits(['submit']);
const address = ref([]);
const loading = ref(false);

const submitForm = async (entry) => {
  if (!entry.customer_address_id || !entry.customer_id) {
    toast.error('Оба поля обязательны для заполнения');
    return;
  }

  // cityZoneCustomer.value.city_zone_id = props.city_zone?.id || null;


  // console.log(cityZoneCustomer.value.toJSONForCreate())
  //
  // return

  const result = await useCityZoneCustomerFunctions().addCityZoneCustomer(cityZoneCustomer.value.toJSONForCreate());

  if (result) {
    // toast.success('Клиент успешно добавлен в зону');
    emits('submit');
    // Сброс формы после успешного добавления
    // cityZoneCustomer.value = new CityZoneCustomer();
    address.value = [];
  }
};

watch(() => cityZoneCustomer.value.customer_id, async (newValue) => {
  if (newValue) {
    const result = await useCustomerAddressFunctions().getCustomerAddressesByCustomerId(newValue);
    address.value = result.length ? result.map(i => CustomerAddress.fromJSON(i)) : [];
  } else {
    address.value = [];
    cityZoneCustomer.value.customer_address_id = null;
  }
});

</script>

<style scoped>
/* Дополнительные стили при необходимости */
</style>
