<template>
  <Button
      variant="outline"
      :disabled="syncing"
      @click="handleSync"
  >
    <RefreshCwIcon
        :class="{ 'animate-spin': syncing }"
        class="h-4 w-4"
    />
    {{ syncing ? 'Синхронизация…' : 'Синхронизировать' }}
  </Button>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {RefreshCwIcon} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import {useSegments} from "@/features/segment/composables/useSegments";

const emit = defineEmits<{
  (e: 'syncedEmit'): void
}>()

const {recalculateAllSegments} = useSegments()
const syncing = ref(false)

// Пересчитывает все сегменты по актуальным заказам/клиентам и
// перезагружает список (счётчики клиентов обновятся).
const handleSync = async (): Promise<void> => {
  if (syncing.value) return
  syncing.value = true
  try {
    await recalculateAllSegments()
    emit('syncedEmit')
  } catch (e) {
    console.log(e)
  } finally {
    syncing.value = false
  }
}
</script>

<style scoped>

</style>
