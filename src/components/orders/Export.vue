<template>
  <Button
      variant="outline"
      size="icon"
      class="w-auto px-3"
      :disabled="sending"
      @click="handleExportAll"
  >
    <Download class="w-4 h-4 mr-2"/>
    {{ sending ? 'Экспорт...' : 'Экспорт' }}
  </Button>
</template>

<script setup lang="ts">
import {Button} from "@/components/ui/button";
import {Download} from "lucide-vue-next";
import {useExportOrders} from "@/composables/Export/useExportOrders";

const {sending, exportOrders} = useExportOrders()

// Экспорт всех заказов
const handleExportAll = async () => {
  await exportOrders({ids: []})
}
</script>