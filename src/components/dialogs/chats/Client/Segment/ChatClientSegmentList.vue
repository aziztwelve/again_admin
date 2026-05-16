<template>
  <ChatClientSegmentTable
      :client="client"
      :segments="segments"
      :pagination="pagination"
      :loading="isLoading"
      @add-client-to-segment="handleAddSegmentToClient"
      @delete-client-to-segment="handleDeleteSegmentToClient"
  />
</template>

<script setup lang="ts">
import {Client} from "@/types/client";
import ChatClientSegmentTable from "@/components/dialogs/chats/Client/Segment/ChatClientSegmentTable.vue";
import {onMounted, ref} from "vue";
import {Segment} from "@/features/segment/types";
import {PaginationMeta} from "@/types/Types";
import {useSegmentsCache} from "@/features/segment/composables/useSegmentsCache";
import {useSegments} from "@/features/segment/composables/useSegments";

interface Props {
  client: Client
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'addedClientToSegment'): void
  (e: 'deletedClientToSegment'): void
}>()

const {loadSegments, isLoading} = useSegmentsCache()
const {attachClients, detachClients} = useSegments()

const pagination = ref<PaginationMeta>({
  page: 1,
  per_page: 10,
  total: 0,
})
const segments = ref<Segment[]>([])

const fetchData = () => {
  loadSegments({
    page: pagination.value.page,
    per_page: pagination.value.per_page,
  })
      .then(res => {
        segments.value = res?.data ?? []
        pagination.value.total = res?.meta.total ?? 0
      })
}

const handleAddSegmentToClient = (segment: Segment): void => {
  attachClients(
      segment.id,
      {
        client_ids: [props.client.id],
      })
      .then(() => {
        props.client.segments?.push(segment)
        emit('addedClientToSegment')
      })
      .catch(error => console.log(error))
}

const handleDeleteSegmentToClient = (segment: Segment): void => {
  detachClients(
      segment.id,
      {
        client_ids: [props.client.id]
      })
      .then(() => {
        props.client.segments = props.client.segments?.filter(s => s.id !== segment.id)
        emit('deletedClientToSegment')
      })
      .catch(error => console.log(error))
}

onMounted(() => {
  fetchData()
})

</script>

<style scoped>

</style>