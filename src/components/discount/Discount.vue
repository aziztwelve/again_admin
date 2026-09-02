<template>
  <div class="w-full">
    <DynamicTabs :tabs="tabs" v-model="activeTab" class="w-full">
      <template #discount class="w-full">
        <DiscountList />
      </template>

      <template #promo>
        <PromoList />
      </template>

      <template #promotion>
        <PromotionList />
      </template>

      <template #referalka>
        <Referalka />
      </template>

      <template #sertifik>
        <Sertifik />
      </template>
    </DynamicTabs>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import DynamicTabs from "@/components/dynamics/shadcn/DynamicTabs.vue";
import DiscountList from "@/components/discount/DiscountList.vue";
import PromoList from "@/components/discount/Promo/PromoList.vue";
import PromotionList from "@/components/discount/Promotion/PromotionList.vue";
// import Referalka from '@/components/discount/Referalka.vue';
// import Sertifik from '@/components/discount/Sertifik.vue';

const store = useStore();

const activeTab = computed<string>({
  get: () => store.getters["tabs/activeTab"],
  set: (value: string) => store.dispatch("tabs/setActiveTab", value),
});

const tabs = computed(() => store.getters["tabs/tabs"]);

// Инициализация tabs при загрузке компонента
onMounted(() => {
  const initialTabs = [
    { title: "Скидки", tab: "discount" },
    { title: "Промокоды", tab: "promo" },
    { title: "Акции", tab: "promotion" },
    { title: "Рефералка", tab: "referalka", disabled: true },
    { title: "Сертификаты", tab: "sertifik", disabled: true },
  ];

  // Инициализируем tabs в store
  store.dispatch("tabs/initializeTabs", initialTabs);
});
</script>

<style scoped></style>
