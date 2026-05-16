<template>

  <div class="flex justify-between mb-2 md:space-x-4 max-md:flex-col max-sm:space-y-2">

    <BackButton
        title="Слайдер на главной"
    />

    <SlideAddWithModal
        @created="fetchData()"
    />

  </div>

  <Loader v-if="isLoading"/>
  <HomeSliderListTable
      v-else
      :key="renderTable"
      :items="slides"
      @deleted="fetchData()"
      @updated="fetchData()"
  />

  <PaginationTable
      class="flex justify-end"
      :total="totalItems"
      :default-page="currentPage"
      :items-per-page="itemsPerPage"
      :sibling-count="1"
      :show-edges="true"
      @current-page="currentPage = $event; fetchData()"
  />

</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import PaginationTable from "@/components/PaginationTable.vue";
import Loader from "@/components/common/Loader.vue";
import BackButton from "@/components/BackButton.vue";
import HomeSliderListTable from "@/components/settings/home_slider/list/HomeSliderListTable.vue";
import {useHomeSlideFunctions} from "@/composables/useHomeSlideFunctions";
import HomeSlider from "@/models/HomeSlider";
import SlideAddWithModal from "@/components/settings/home_slider/SlideAddWithModal.vue";


const renderTable = ref(1)


const isLoading = ref(true)
const slides = ref<HomeSlider[]>([])

const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(15);


onMounted(async () => {
  await fetchData()
})

const {getSlides} = useHomeSlideFunctions()

async function fetchData() {

  isLoading.value = true

  slides.value = await getSlides() ?? []

  isLoading.value = false
  renderTable.value++
}

</script>
