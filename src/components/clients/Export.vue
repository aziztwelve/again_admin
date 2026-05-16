<template>
  <div class="flex gap-2">
    <Button
        variant="outline"
        size="icon"
        class="w-auto px-3"
        :disabled="sending"
        @click="handleExportAll"
    >
      <Download class="w-4 h-4 mr-2"/>
      {{ sending ? 'Экспорт...' : 'Экспорт всех' }}
    </Button>

    <Button
        v-if="selectedIds.length > 0"
        variant="outline"
        size="icon"
        class="w-auto px-3"
        :disabled="sending"
        @click="handleExportSelected"
    >
      <Download class="w-4 h-4 mr-2"/>
      {{ sending ? 'Экспорт...' : `Экспорт (${selectedIds.length})` }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import {Button} from "@/components/ui/button";
import {Download} from "lucide-vue-next";
import {useExportClients} from "@/composables/Export/useExportClients";

interface Props {
  selectedIds?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  selectedIds: () => []
})

const {sending, exportClients} = useExportClients()

// Экспорт всех клиентов
const handleExportAll = async () => {
  await exportClients({ids: []})
}

// Экспорт выбранных клиентов
const handleExportSelected = async () => {
  if (props.selectedIds.length === 0) return
  await exportClients({ids: props.selectedIds})
}
</script>