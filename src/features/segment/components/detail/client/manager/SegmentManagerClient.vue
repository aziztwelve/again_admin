<template>
  <DialogModal
      title="Управление клиентами сегмента"
      description="Добавьте или удалите клиентов из сегмента"
      dynamic-style="2xl:min-w-[80vw] xl:min-w-[95vw] max-md:min-w-full md:min-w-[95vw]"
  >
    <template #button>
      <Button
          :disabled="segment.recalculate_frequency !== 'manual'"
          variant="outline"
          class="max-md:w-full"
      >
        {{ segment.recalculate_frequency === 'manual'
          ? 'Добавить клиент'
          : 'Автоматический сегмент'
        }}
      </Button>
    </template>

    <template #content>
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
          <SegmentManagerClientList
              :segment-id="segmentId"
              :segment-client-manager="segmentClientManager"
              @attach="emits('attach', $event)"
              @detach="emits('detach', $event)"
          />

          <div class="sticky bottom-0 left-0 right-0 border-t border-gray-200 p-4 mt-4 bg-white">
            <div class="flex items-center justify-between">
              <!-- Информация об изменениях -->
              <div class="text-sm text-gray-600">
                <span v-if="hasChanges">
                  <span v-if="pendingAttachCount > 0" class="text-green-600 font-medium">
                    +{{ pendingAttachCount }} добавить
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
  </DialogModal>
</template>

<script setup lang="ts">
import {Button} from "@/components/ui/button";
import {Loader} from "lucide-vue-next";
import DialogModal from "@/components/dynamics/shadcn/DialogModal.vue";
import type {Segment, SegmentClientManager} from "@/features/segment/types";
import {computed} from "vue";
import SegmentManagerClientList from "./SegmentManagerClientList.vue";

interface PropsData {
  segmentClientManager: SegmentClientManager;
  sending: boolean;
  segmentId: number;
  segment: Segment
}

const props = defineProps<PropsData>()

const emits = defineEmits<{
  attach: (clientId: number) => void;
  detach: (clientId: number) => void;
  apply: any
  cancel: any
}>();

// Вычисляемые свойства
const pendingAttachCount = computed(() => {
  return props.segmentClientManager.pendingAttach.length
})

const pendingDetachCount = computed(() => {
  return props.segmentClientManager.pendingDetach.length
})

const hasChanges = computed(() => {
  return pendingAttachCount.value > 0
})

// Применить изменения
const handleApply = () => {
  emits('apply')
}

// Отменить изменения
const handleCancel = () => {
  emits('cancel')
}
</script>