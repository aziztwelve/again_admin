<template>
  <div class="space-y-6">
    <!-- Спиннер или плейсхолдер пока грузятся данные -->
    <loader v-if="loading"/>

    <form v-else class="grid gap-3">
      <!-- Зона -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Зона</label>
        <DynamicsDropdownSelect
            :options="city_zones"
            v-model="cityZoneCustomer.city_zone_id"
            option-label="zone"
            option-value="id"
            placeholder="Выберите зону"
            required
        />
      </div>
      <!-- Клиент -->
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
      <!-- Адрес -->
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
    </form>
  </div>
</template>

<script setup>
import {ref, watch, onMounted} from 'vue'
import {useCustomerAddressFunctions} from '~/composables/useCustomerAddressFunctions'
import {CustomerAddress} from '~/services/CustomerAddress'
import {CityZoneCustomer} from '~/services/CityZoneCustomer'

const props = defineProps({
  city_zones: {type: Array, default: () => []},
  customers: {type: Array, default: () => []},
  cityZoneCustomer: {type: CityZoneCustomer}
})

const cityZoneCustomer = ref(props.cityZoneCustomer)
const address = ref([])
const loading = ref(true)

onMounted(() => {
  nextTick()
  loading.value = false
})

watch(
    () => cityZoneCustomer.value.customer_id,
    async (id) => {
      if (!id) {
        address.value = []
        cityZoneCustomer.value.customer_address_id = null
        return
      }
      const result = await useCustomerAddressFunctions().getCustomerAddressesByCustomerId(id)
      if (!result?.length) {
        address.value = []
        cityZoneCustomer.value.customer_address_id = null
      }
      address.value = result.map(i => CustomerAddress.fromJSON(i))
    },
    {immediate: true}
)
</script>
