<template>
  <div class="space-y-2">

    <div class="md:flex justify-between items-center max-md:space-y-2">
      <SegmentSearch
          :filter="searchParams"
          @search="handleSearch"
      />
      <SegmentAdd
          @create-emit="handleCreate"
      />
    </div>

    <SegmentTable
        :loading="sending"
        :segments="segments"
        :pagination="searchParams"
        @delete-emit="handleDelete"
        @update-emit="handleUpdate"
        @recalculated-emit="getData"
    />
  </div>
</template>

<script setup lang="ts">
import {useSegments} from "@/features/segment/composables/useSegments";
import {
  formDataToUpdateRequest,
  Segment,
  SegmentSearchType,
  segmentToFormData
} from "@/features/segment/types";
import {onMounted, ref} from "vue";
import SegmentTable from "@/features/segment/components/list/SegmentTable.vue";
import SegmentAdd from "@/features/segment/components/add/SegmentAdd.vue";
import SegmentSearch from "@/features/segment/components/list/SegmentSearch.vue";

const segments = ref<Segment[]>();

const searchParams = ref<SegmentSearchType>({
  page: 1,
  per_page: 15,
  total: 0,
  search: undefined,
  is_active: undefined,
});

const {getSegments, deleteSegment, updateSegment, sending} = useSegments()

onMounted(async () => {
  await getData()
})

async function getData() {
  getSegments(searchParams.value)
      .then(res => {
        segments.value = res?.data ?? []
        searchParams.value.total = res?.meta.total ?? 0
      })
}


const handleDelete = async (segment: Segment) => {
  if (!segment.id) return
  try {
    await deleteSegment(segment.id)
    segments.value = segments.value?.filter(s => s.id != segment.id)
  } catch (e) {
    console.log(e)
  }
}


const handleUpdate = async (segment: Segment) => {
  if (!segment.id) return

  const segmentFormData = segmentToFormData(segment)
  const formData = formDataToUpdateRequest(segmentFormData)

  try {
    const updatedSegment = await updateSegment(segment.id, formData)

    segments.value = segments.value
        ?.map((s: Segment) => s.id === updatedSegment?.id ? updatedSegment : s)

  } catch (e) {
    console.log(e)
  }
}

const handleCreate = (segment: Segment) => {
  segments.value = [segment, ...(segments.value ?? [])]
}


const handleSearch = () => {
  searchParams.value.page = 1
  getData()
}

</script>

<style scoped>

</style>