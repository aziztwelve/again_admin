<template>
  <CityZoneCustomerEditForm
      :city_zones="cityZones"
      :customers="customers"
      :city-zone-customer="props.item"
      @submit="emits('submit'); dialogOpen = false"
  />
</template>

<script setup lang="ts">
import {Customer} from "~/services/customer/Customer";

const emits = defineEmits(["submit"]);

const props = defineProps({
  dynamicData: {
    type: Object
  },
  item: Object
})


const config = useRuntimeConfig();
const dialogOpen = ref(false);

const cityZones = ref([])
const customers = ref([])

const loading = ref(false);


// const newEntry = ref(CityZoneCustomer.fromJSON({
//   city_zone_id: props.city_zone?.id || null
// }))

onMounted(async () => {
  if (!dialogOpen) return
  cityZones.value = await useCityZoneFunctions().getCityZones()
  await useCustomerFunctions().getCustomers().then(res => {
    if (res?.length) {
      customers.value = res.map((item) => Customer.fromJSON(item))
    }
  })
})


</script>

<style scoped></style>
