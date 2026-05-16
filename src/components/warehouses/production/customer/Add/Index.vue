<template>
  <div class="flex justify-end">
    <Button
        variant="outline"
        size="icon"
        class="w-auto px-3"
        @click="dialogOpen = true"
    >
      <CirclePlus class="w-3 h-3"/>
    </Button>

    <DynamicsModal
        :dialog-open="dialogOpen"
        @close="dialogOpen = false"
        title="Добавить клиента в зону"
    >
      <template v-slot:content>
        <CityZoneCustomerAddForm
            :city_zones="cityZones"
            :customers="customers"
            :city-zone-customer="newEntry"
            @submit="emit('created'); dialogOpen = false"
        />
      </template>
    </DynamicsModal>
  </div>
</template>

<script setup lang="ts">
import {Button} from "@/components/ui/button";
import {CirclePlus} from "lucide-vue-next";
import {Customer} from "~/services/customer/Customer";
import {CityZoneCustomer} from "~/services/CityZoneCustomer";

const config = useRuntimeConfig();
const emit = defineEmits(['created']);
const dialogOpen = ref(false);

const cityZones = ref([])
const customers = ref([])

const props = defineProps({
  city_zone: {
    type: Object,
    default: () => []
  },
});


const newEntry = ref(CityZoneCustomer.fromJSON({
  city_zone_id: props.city_zone?.id || null
}))

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
