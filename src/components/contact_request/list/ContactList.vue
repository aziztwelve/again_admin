<template>
  <div class="flex justify-between mb-2 md:space-x-4 max-md:flex-col">
    <DynamicTitle
        title="Заявки"
        variant="primary"
    />

    <div class="w-full  flex md:space-x-2 max-md:space-y-2 max-md:flex-col">
      <ContactListSearch
          :filter="searchParams"
          @search="handleSearch"
      />

      <Button
          v-if="hasActiveFilters"
          variant="outline"
          @click="resetFilters"
      >
        <X/>
      </Button>

    </div>
  </div>
  <ContactListTable
      :items="contacts"
      :pagination="pagination"
      :loading="sending"
      @deleted="fetchData()"
      @updated="fetchData()"
  />

</template>

<script setup lang="ts">
import {ref, onMounted, computed, watch} from 'vue';
import DynamicTitle from "@/components/dynamics/DynamicTitle.vue";
import Button from "@/components/ui/button/Button.vue";
import {X} from "lucide-vue-next"
import ContactListSearch from "@/components/contact_request/list/ContactListSearch.vue";
import ContactListTable from "@/components/contact_request/list/ContactListTable.vue";
import ContactRequest from "@/models/ContactRequest";
import {useContactRequestFunctions} from "@/composables/useContactRequestFunctions";
import {useStore} from "vuex";
import {PaginationMeta} from "@/types/Types";


const store = useStore();

const searchParams = ref({
  datePicker: {
    start: '',
    end: ''
  },
  search: '',
  status: '',
})


const hasActiveFilters = computed(() => {
  return !!searchParams.value.search || !!searchParams.value.datePicker.start || !!searchParams.value.datePicker.end || !!searchParams.value.status
})

const pagination = ref<PaginationMeta>({
  page: 1,
  per_page: 15,
  total: 0,
})

const contacts = ref<ContactRequest[]>([])


onMounted(async () => {
  await fetchData()
  await store.dispatch('notifications/markRequestsChecked');
})

const {getContactRequests, sending} = useContactRequestFunctions()

async function fetchData() {

  const result = await getContactRequests({
    status: searchParams.value.status,
    page: pagination.value.page,
    per_page: pagination.value.per_page,
    search: searchParams.value.search,
    date_from: searchParams.value.datePicker.start,
    date_to: searchParams.value.datePicker.end
  })

  contacts.value = result?.contactRequests ?? []
  pagination.value.total = result?.meta.total ?? 0
}


const handleSearch = () => {
  fetchData()
}


function resetFilters() {
  searchParams.value = {
    datePicker: {
      start: '',
      end: ''
    },
    search: '',
    status: '',
  }
  fetchData()
}


watch(
    () => [pagination.value.page, pagination.value.per_page],
    () => fetchData()
)

</script>
