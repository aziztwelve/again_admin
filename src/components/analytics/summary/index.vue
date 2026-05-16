<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
      <DynamicTitle title="Сводка"/>
      <p class="text-sm text-muted-foreground mt-1 md:mt-0">
        Данные аналитики получены из МойСклад
      </p>
    </div>

    <AnalyticSearch
        :filter="searchParams"
    />

    <div class="mt-2">

      <div class="space-y-2">
        <ProductsIncome :filter="searchParams"/>
<!--        <WeeklyAmount :filter="searchParams"/>-->
      </div>

      <div class="grid gap-4 lg:grid-cols-2 max-lg:grid-cols-1 mt-2">
        <FinancialSummaryOrders :filter="searchParams"/>
        <FinancialSummarySales :filter="searchParams"/>
      </div>

    </div>

<!--        <CombinedAnalytics :filter="searchParams"/>-->
    <!--    <DiscountsAnalytics :filter="searchParams"/>-->

  </div>
</template>

<script setup lang="ts">

import AnalyticSearch from "@/components/analytics/summary/AnalyticSearch.vue";
import {ref} from "vue";
import DynamicTitle from "@/components/dynamics/DynamicTitle.vue";
import FinancialSummarySales from "@/components/analytics/summary/FinancialSummarySales.vue";
import FinancialSummaryOrders from "@/components/analytics/summary/FinancialSummaryOrders.vue";
import CombinedAnalytics from "@/components/analytics/summary/CombinedAnalytics.vue";
import DiscountsAnalytics from "@/components/analytics/summary/DiscountsAnalytics.vue";
import ProductsIncome from "@/components/analytics/summary/ProductsIncome.vue";
import WeeklyAmount from "@/components/analytics/summary/WeeklyAmount.vue";


const renderAnalytics = ref(1)

const searchParams = ref({
  datePicker: {
    start: undefined,
    end: undefined,
  },
})

</script>

<style scoped>

</style>