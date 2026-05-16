<template>
  <div class="">
    <div class="flex max-md:flex-col justify-between mb-2 max-md:space-y-2">
      <SegmentManagerClientSearch
          class="md:w-[400px]"
          :filter="paramsSearch"
          @search="handleSearch"
      />
    </div>
    <SegmentManagerClientTable
        :sending="sending"
        :items="data"
        :segment-client-manager="segmentClientManager"
        :pagination="pagination"
        @attach="emits('attach', $event)"
        @detach="emits('detach', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';
import {PaginationMeta} from "@/types/Types";
import type {SegmentClientManager} from "@/features/segment/types";
import {Client} from "@/types/client";
import SegmentManagerClientSearch from "./SegmentManagerClientSearch.vue";
import SegmentManagerClientTable from "./SegmentManagerClientTable.vue";
import {useSegments} from "@/features/segment/composables/useSegments";

const data = ref<Client[]>([]);

interface PropsData {
  segmentId: number;
  segmentClientManager: SegmentClientManager;
}

const props = defineProps<PropsData>()

const emits = defineEmits<{
  attach: (clientId: number) => void;
  detach: (clientId: number) => void;
}>();

const pagination = ref<PaginationMeta>({
  page: 1,
  per_page: 10,
  total: 0
})
const paramsSearch = ref({
  search: '',
})

const {getSegmentAvailableClients, sending} = useSegments()

onMounted(() => {
  fetchData()
})

async function fetchData() {

  data.value = await getSegmentAvailableClients(props.segmentId, {
    per_page: pagination.value.per_page ?? 10,
    page: pagination.value.page ?? 1,
    search: paramsSearch.value.search,
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
