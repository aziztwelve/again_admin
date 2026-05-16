<template>

  <div class="relative">
    <div
        v-if="sending"
        class="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div class="flex flex-col items-center gap-3">
        <Loader class="h-8 w-8 animate-spin text-primary"/>
        <p class="text-sm text-gray-600 font-medium">Применяем изменения...</p>
      </div>
    </div>

    <!-- Основной контент -->
    <div :class="{'pointer-events-none opacity-50': sending}">


      <div class="sticky bottom-0 left-0 right-0 border-t border-gray-200 p-4 mt-4 bg-white">
        <div class="flex items-center justify-between">
          <!-- Информация об изменениях -->
          <div class="text-sm text-gray-600">
                <span v-if="hasChanges">

                  <span v-if="pendingDetachCount > 0" class="text-red-600 font-medium">
                    -{{ pendingDetachCount }} удалить
                  </span>
                </span>
            <span v-else class="text-gray-400">
                  Нет изменений
                </span>
          </div>

          <!-- Кнопки -->
          <div class="flex items-center gap-2">
            <Button
                variant="outline"
                @click="handleCancel"
                :disabled="!hasChanges || sending"
            >
              Отменить
            </Button>

            <Button
                @click="handleApply"
                :disabled="!hasChanges || sending"
            >
              <Loader v-if="sending" class="h-4 w-4 mr-2 animate-spin"/>
              Применить изменения
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Button} from "@/components/ui/button";
import {Loader} from "lucide-vue-next";
import type {SegmentClientManager} from "@/features/segment/types";
import {computed} from "vue";
import {useSegments} from "@/features/segment/composables/useSegments";

interface PropsData {
  segmentClientManager: SegmentClientManager;
  segmentId: number;
}

const props = defineProps<PropsData>()

const {sending, detachClients} = useSegments()

const emits = defineEmits<{
  updated: any
  cancel: any
}>();


const pendingDetachCount = computed(() => {
  return props.segmentClientManager.pendingDetach.length
})

const hasChanges = computed(() => {
  return pendingDetachCount.value > 0
})

// Применить изменения
const handleApply = async () => {

  try {

    const pD = props.segmentClientManager.pendingDetach

    const payload = {
      client_ids: pD
    }
    await detachClients(props.segmentId, payload)

    emits('updated')

  } catch (e) {

  }

  emits('updated')
}

// Отменить изменения
const handleCancel = () => {
  emits('cancel')
}
</script>