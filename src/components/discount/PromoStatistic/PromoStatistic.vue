<template>
  <PromoStatisticList/>
</template>

<script setup lang="ts">
import {useStore} from 'vuex'
import {onBeforeUnmount} from "vue";
import PromoStatisticList from "@/components/discount/PromoStatistic/list/PromoStatisticList.vue";

const store = useStore()

onBeforeUnmount(() => {
  store.commit('tabs/disable_tab', 'promoStatistic')
})

</script>

<style scoped>

</style>