<template>
    <div class="md:flex justify-between md:mb-2 md:space-x-2">
      <ClientSearch
          :filter="filters"
          @search="handleSearch"
      />
      <div class="flex gap-2 max-md:my-2">
        <ClientsExport
            :selected-ids="selectedIds"
        />
        <ClientsAdd
            @submit="fetchData()"
        />
      </div>
    </div>

    <ClientsTable
        :key="renderTable"
        :clients="clients"
        :pagination="pagination"
        @deleted="deleteClient($event)"
        @updated="fetchData"
        @selection-changed="handleSelectionChanged"
    />
</template>

<script setup lang="ts">
import axios from "axios";
import {ref, onMounted, watch} from "vue"
import ClientsTable from "@/components/clients/Table.vue";
import ClientsAdd from "@/components/clients/Add/Index.vue";
import {Client} from "@/models/client/Client";
import ClientSearch from "@/components/clients/ClientSearch.vue";
import {Pagination} from "@/types/Types";
import ClientsExport from "@/components/clients/Export.vue";


const clients = ref<Client[]>([]);
const selectedIds = ref<number[]>([]);

const renderTable = ref(1)

const pagination = ref<Pagination>({
  page: 1,
  per_page: 15,
  total: 0,
});


const filters = ref({
  search: "",
  birth_date: {
    start: undefined,
    end: undefined,
  }
})


const deleteClient = (client: Client) => {
  clients.value = clients.value.filter(
      (item) => item.id !== client.id
  );
};


const handleSelectionChanged = (ids: number[]) => {
  selectedIds.value = ids
}

async function fetchData() {

  const p = {
    page: pagination.value.page,
    per_page: pagination.value.per_page,
    search: filters.value.search,
    birth_date_from: filters.value.birth_date.start ?? null,
    birth_date_to: filters.value.birth_date.end ?? null,
  }

  try {
    const response = await axios.get(`/clients`, {
      params: p
    });

    if (response.data?.clients) {
      clients.value = response.data.clients.data.map((item: any) => Client.fromJSON(item));
      pagination.value.total = response.data.clients.total;
    }
  } catch (error) {
    console.error("Error fetching clients:", error);
    clients.value = [];
  }
  finally {
  }
}

onMounted(() => {
  fetchData();
});


const handleSearch = async () => {
  pagination.value.page = 1;
  await fetchData()
}


watch(
    () => pagination.value.page, // Следим только за страницей
    () => {
      selectedIds.value = [] // Сбрасываем выбор
      renderTable.value++
      fetchData()
    }
)

watch(
    () => pagination.value.per_page, // Следим за per_page отдельно
    () => {
      fetchData()
    }
)

</script>