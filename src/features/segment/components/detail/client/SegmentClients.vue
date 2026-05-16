<template>
  <Card>
    <CardHeader class="flex flex-col ">

      <CardTitle>Клиенты сегмента</CardTitle>
      <div class="flex flex-col max-md:space-y-2 md:items-center justify-between md:flex-row">
        <SegmentClientSearch
            :filter="searchParams"
            @search="handleSearch"
        />
        <SegmentManagerClient
            :segment-client-manager="segmentClientManager"
            :sending="sending"
            :segment="segment"
            :segment-id="segmentId"
            @attach="handleAttach"
            @detach="handleDetach"
            @cancel="handleCancel"
            @apply="handleApply"
        />
      </div>

    </CardHeader>

    <CardContent>
      <!-- Загрузка -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <Loader class="h-6 w-6 animate-spin text-gray-400"/>
      </div>

      <!-- Список клиентов -->
      <div v-else-if="clients?.length > 0" class="space-y-3">
        <SegmentClientTable
            :clients="clients"
            :sending="sending"
            :pagination="pagination"
            :segment-client-manager="segmentClientManager"
        />

        <SegmentDetachClient
            :segment-client-manager="segmentClientManager"
            :segment-id="segmentId"
            @updated="handleDetachUpdated"
            @cancel="handleCancelDetach"
        />

      </div>

      <!-- Пустое состояние -->
      <div v-else class="text-center py-12">
        <Users class="h-12 w-12 text-gray-300 mx-auto mb-3"/>
        <p class="text-gray-500 mb-4">В этом сегменте пока нет клиентов</p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card'
import {Users, Loader} from 'lucide-vue-next'
import {useSegments} from '@/features/segment/composables/useSegments'
import {
  FilterSegmentClientsParams,
  SegmentClient,
  SegmentClientManager,
  SegmentDetail
} from '@/features/segment/types'
import SegmentClientTable from "./SegmentClientTable.vue"
import SegmentManagerClient from "./manager/SegmentManagerClient.vue"
import {PaginationMeta} from "@/types/Types";
import SegmentClientSearch from "./SegmentClientSearch.vue";
import SegmentDetachClient from "./SegmentDetachClient.vue";

interface Props {
  segment: SegmentDetail
  segmentId: number,
}

const clients = ref<SegmentClient[]>([])
const props = defineProps<Props>()
const emit = defineEmits(['updated'])

const pagination = ref<PaginationMeta>({
  page: 1,
  per_page: 10,
  total: 0,
})

const searchParams = ref<FilterSegmentClientsParams>({
  search: '',
})

const segmentClientManager = ref<SegmentClientManager>({
  attached: clients?.value.map(c => c.id) ?? [],
  attachedOriginal: clients?.value.map(c => c.id) ?? [],
  pendingAttach: [],
  pendingDetach: [],
})

const {attachClients, getSegmentClients, sending} = useSegments()

const loading = ref(false)

const handleAttach = (id: number) => {
  const s = segmentClientManager.value

  if (s.attachedOriginal.includes(id)) {
    if (!s.attached.includes(id)) {
      s.attached.push(id)
      s.pendingDetach = s.pendingDetach.filter(c => c !== id)
    }
    return
  }

  segmentClientManager.value.pendingAttach.push(id)
}

const handleDetach = (id: number) => {
  const s = segmentClientManager.value

  if (s.attached.includes(id) && s.attachedOriginal.includes(id)) {
    s.attached = s.attached.filter(item => item !== id)
    s.pendingDetach.push(id)
    return
  }

  s.pendingAttach = s.pendingAttach.filter(item => item !== id)
}

const handleCancel = () => {
  segmentClientManager.value.pendingAttach = []
  segmentClientManager.value.pendingDetach = []
  segmentClientManager.value.attached = segmentClientManager.value.attachedOriginal
}


const handleCancelDetach = () => {
  segmentClientManager.value.pendingDetach = []
  segmentClientManager.value.attached = []
}

const handleApply = async () => {
  const s = segmentClientManager.value

  try {
    if (s.pendingAttach.length > 0) {
      const attachPayload = {
        client_ids: s.pendingAttach,
      }
      await attachClients(props.segmentId, attachPayload)
    }

    emit('updated')
  } catch (e) {
    console.error(e)
  }
}


const handleDetachUpdated = () => {
  handleCancelDetach()
  pagination.value.page = 1
  getClientsData()
}


const getClientsData = () => {

  const params: FilterSegmentClientsParams = {
    page: pagination.value.page,
    per_page: pagination.value.per_page,
    search: searchParams.value.search,
  }

  getSegmentClients(props.segmentId, params)
      .then((res) => {
        clients.value = res?.data ?? []
        pagination.value.total = res?.meta.total ?? 0
      })
}

onMounted(() => getClientsData())

watch(
    [() => pagination.value.page, () => pagination.value.per_page],
    () => {
      getClientsData()
    }
)


const handleSearch = () => {
  pagination.value.page = 1
  getClientsData()
}

</script>