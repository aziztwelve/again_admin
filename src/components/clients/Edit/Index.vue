<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-3">
      <div class="rounded border bg-muted/30 p-3">
        <div class="text-xs text-muted-foreground mb-1">Всего заказов</div>
        <button
            type="button"
            class="text-2xl font-semibold text-blue-600 hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-default"
            :disabled="!totalOrders"
            @click="ordersModalOpen = true"
        >
          <span v-if="loadingStats" class="inline-block animate-pulse">…</span>
          <span v-else>{{ totalOrders }}</span>
        </button>
      </div>

      <div class="rounded border bg-muted/30 p-3">
        <div class="text-xs text-muted-foreground mb-1">Оборот</div>
        <div class="text-2xl font-semibold">
          <span v-if="loadingStats" class="inline-block animate-pulse">…</span>
          <span v-else>{{ formatPrice(totalSpent) }}</span>
        </div>
      </div>
    </div>

    <ClientsEditForm
        :client-id="item.id"
        :client-data="item"
    />

    <ClientOrdersModal
        v-model:open="ordersModalOpen"
        :client-id="item.id"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import axios from 'axios'
import ClientsEditForm from "@/components/clients/Edit/Form.vue";
import ClientOrdersModal from "@/components/clients/Edit/ClientOrdersModal.vue";
import {Client} from "@/models/client/Client";
import {usePriceFormatter} from "@/composables/usePriceFormatter";

const props = defineProps({
  item: {
    type: Object as () => Client,
    required: true
  }
})

const {formatPrice} = usePriceFormatter()

const totalOrders = ref<number>(0)
const totalSpent = ref<number>(0)
const loadingStats = ref<boolean>(true)
const ordersModalOpen = ref<boolean>(false)

onMounted(async () => {
  if (!props.item?.id) {
    loadingStats.value = false
    return
  }
  try {
    const {data} = await axios.get(`/clients/${props.item.id}`)
    totalOrders.value = Number(data?.statistics?.total_orders ?? 0)
    totalSpent.value = Number(data?.statistics?.total_spent ?? 0)
  } catch (e) {
    console.error('Не удалось загрузить статистику клиента', e)
  } finally {
    loadingStats.value = false
  }
})
</script>

<style scoped></style>
