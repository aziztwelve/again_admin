<template>
  <Loader v-if="isLoading"/>
  <Form v-else
        :batch="batch"
        @complete_batch="completeBatch"
  />
</template>

<script setup lang="ts">
import Form from "@/components/warehouses/production/edit/Form.vue"
import axios from "axios";
import {useRoute, useRouter} from "vue-router";
import {ref, onMounted} from "vue";
import {toast} from "vue-sonner";
import {Batch} from "@/models/Batch";
import {useProductionFunctions} from "@/composables/useProductionFunctions";


const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const batch = ref()

onMounted(async () => {
  await fetchProduction()
})

async function fetchProduction() {
  await axios.get(`/production?batch_number=${route.params.id}&with_batches=true`)
      .then(res => {
        batch.value = res.data?.data
      })
      .catch(err => {
        toast.error(err.response.data.message || err.response.data.error || 'Что то пащло не так!')
      })
      .finally(() => {
        isLoading.value = false
      })
}


async function completeBatch(batches: Batch[]) {
  if (batches.length) {
    const batch = {
      batch_number: batches[0]?.batch_number,
      id: batches[0]?.id
    }
    const result = await useProductionFunctions().completeBatch(batch)

    // console.log(result)

    if (result) {
      await router.push('/warehouses/production/list')
    }
  }
}


</script>

<style scoped></style>
