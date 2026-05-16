<template>
  <div class="flex justify-end">

    <Eye :size="17" @click="dialogOpen = true"
         class="text-gray-400 hover:text-gray-500 transition cursor-pointer"/>

    <DynamicsModal
        :dialog-open="dialogOpen"
        @close="dialogOpen = false"
        title=""
    >
      <template v-slot:content>
        <CityZoneDetailsPartialShow :city_zone="props.city_zone"/>
      </template>
    </DynamicsModal>
  </div>
</template>

<script setup lang="ts">
import {Eye} from "lucide-vue-next";

const dialogOpen = ref(false);

const props = defineProps({
  city_zone: {
    type: Object,
    default: () => []
  },
});


</script>

<style scoped></style>
