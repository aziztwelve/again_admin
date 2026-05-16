<template>
  <DialogModal
      title="Управление промокодами сегмента"
      description="Добавьте или удалите промокоды из сегмента"
      dynamic-style="2xl:min-w-[80vw] xl:min-w-[95vw] max-md:min-w-full md:min-w-[95vw]"
  >
    <template #button>
      <Button
          variant="outline"
          class="max-md:w-full"
      >
        Управление промокодами
      </Button>
    </template>

    <template #content>
      <div class="relative">
        <div
            v-if="sending"
            class="absolute inset-0 bg-white/10 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div class="flex flex-col items-center gap-3">
            <Loader class="h-8 w-8 animate-spin text-primary"/>
            <p class="text-sm text-gray-600 font-medium">Применяем изменения...</p>
          </div>
        </div>

        <!-- Основной контент -->
        <div :class="{'pointer-events-none opacity-50': sending}">
          <SegmentPromoCodeAddList
              :segment-promo-code-manager="segmentPromoCodeManager"
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
              <span v-if="pendingAttachCount > 0 && pendingDetachCount > 0">
                ,
              </span>
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
  </DialogModal>
</template>

<script setup lang="ts">
import {Button} from "@/components/ui/button";
import DialogModal from "@/components/dynamics/shadcn/DialogModal.vue";
import SegmentPromoCodeAddList from "@/features/segment/components/detail/promo-code/Add/SegmentPromoCodeAddList.vue";
import type {SegmentPromoCodeManager} from "@/features/segment/types";
import {computed} from "vue";

interface PropsData {
  segmentPromoCodeManager: SegmentPromoCodeManager;
  sending: boolean;
}

const props = defineProps<PropsData>()

const emits = defineEmits<{
  attach: (promoCodeId: number) => void;
  detach: (promoCodeId: number) => void;
  apply: any
  cancel: any
}>();


// Вычисляемые свойства
const pendingAttachCount = computed(() => {
  return props.segmentPromoCodeManager.pendingAttach.length
})

const pendingDetachCount = computed(() => {
  return props.segmentPromoCodeManager.pendingDetach.length
})

const hasChanges = computed(() => {
  return pendingAttachCount.value > 0 || pendingDetachCount.value > 0
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
