<template>
  <div class="">
    <div class="flex max-md:flex-col justify-between mb-2 max-md:space-y-2">
      <PromoSearch
          class="md:w-[400px]"
          :filter="paramsSearch"
          @search="handleSearch"
      />
    </div>
    <SegmentPromoCodeAddTable
        :sending="sending"
        :items="data"
        :segment-promo-code-manager="segmentPromoCodeManager"
        :pagination="pagination"
        @attach="emits('attach', $event)"
        @detach="emits('detach', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';
import PromoSearch from "@/components/discount/Promo/PromoSearch.vue";
import {usePromoCodeFunctions} from "@/composables/usePromoCodeFunctions";
import {PromoCode} from "@/models/PromoCode";
import SegmentPromoCodeAddTable from "@/features/segment/components/detail/promo-code/Add/SegmentPromoCodeAddTable.vue";
import {PaginationMeta} from "@/types/Types";
import type {SegmentPromoCodeManager} from "@/features/segment/types";

const data = ref<PromoCode[]>([]);

interface PropsData {
  segmentPromoCodeManager: SegmentPromoCodeManager;
}

defineProps<PropsData>()

const emits = defineEmits<{
  attach: (promoCodeId: number) => void;
  detach: (promoCodeId: number) => void;
}>();

const pagination = ref<PaginationMeta>({
  page: 1,
  per_page: 15,
  total: 0
})
const paramsSearch = ref({
  search: '',
})

const {getPromoCodes, sending} = usePromoCodeFunctions()

onMounted(() => {
  fetchData()
})

async function fetchData() {


  data.value = await getPromoCodes({
    per_page: pagination.value.per_page,
    page: pagination.value.page,
    code: paramsSearch.value.search,
  })
      .then(res => {
        pagination.value.total = res?.meta?.total ?? 1
        return res?.data ?? []
      })

}

const handleSearch = async () => {
  pagination.value.page = 1;
  await fetchData()
}


watch(
    [() => pagination.value.page, () => pagination.value.per_page],
    () => {
      fetchData()
    }
)

</script>
