<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between">
      <CardTitle>Промокоды сегмента</CardTitle>
      <SegmentPromoCodeAddModal
          :segment-promo-code-manager="segmentPromoCodeManager"
          :sending="sending"
          @attach="handleAttach"
          @detach="handleDetach"
          @cancel="handleCancel"
          @apply="handleApply"
      />
    </CardHeader>

    <CardContent>
      <!-- Загрузка -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <Loader class="h-6 w-6 animate-spin text-gray-400"/>
      </div>

      <!-- Список промокодов -->
      <div v-else-if="promoCodes.length > 0" class="space-y-3">

        <SegmentPromoCodeTable
            :promo-codes="promoCodes"
        />

      </div>

      <!-- Пустое состояние -->
      <div v-else class="text-center py-12">
        <Ticket class="h-12 w-12 text-gray-300 mx-auto mb-3"/>
        <p class="text-gray-500 mb-4">В этом сегменте пока нет промокодов</p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card'
import {Ticket, Loader} from 'lucide-vue-next'
import {useSegments} from '@/features/segment/composables/useSegments'
import type {SegmentPromoCodeBrief, SegmentPromoCodeManager} from '@/features/segment/types'
import SegmentPromoCodeTable from "@/features/segment/components/detail/promo-code/SegmentPromoCodeTable.vue";
import SegmentPromoCodeAddModal from "@/features/segment/components/detail/promo-code/Add/SegmentPromoCodeAddModal.vue";

interface Props {
  segmentId: number
  promoCodes: SegmentPromoCodeBrief[]
}

const props = defineProps<Props>()
const emit = defineEmits(['updated'])


const segmentPromoCodeManager = ref<SegmentPromoCodeManager>({
  attached: props.promoCodes?.map(p => p.id) ?? [],
  attachedOriginal: props.promoCodes?.map(p => p.id) ?? [],
  pendingAttach: [],
  pendingDetach: [],
})


const {detachPromoCodes, attachPromoCodes, sending} = useSegments()

const loading = ref(false)


const handleAttach = (id: number) => {

  const s = segmentPromoCodeManager.value

  if (s.attachedOriginal.includes(id)) {
    if (!s.attached.includes(id)) {
      s.attached.push(id)
      s.pendingDetach = s.pendingAttach.filter(p => p !== id)
    }
    return
  }

  segmentPromoCodeManager.value.pendingAttach.push(id)
}

const handleDetach = (id: number) => {

  const s = segmentPromoCodeManager.value

  if (s.attached.includes(id) && s.attachedOriginal.includes(id)) {
    s.attached = s.attached.filter(item => item !== id)
    s.pendingDetach.push(id)
    return
  }

  s.pendingAttach = s.pendingAttach.filter(item => item !== id)

}

const handleCancel = () => {
  segmentPromoCodeManager.value.pendingAttach = []
  segmentPromoCodeManager.value.pendingDetach = []
  segmentPromoCodeManager.value.attached = segmentPromoCodeManager.value.attachedOriginal
}

const handleApply = async () => {

  const s = segmentPromoCodeManager.value

  try {

    if (s.pendingAttach.length > 0) {
      const attachPayload = {
        promo_code_ids: s.pendingAttach,
        auto_apply: true,
      }
      await attachPromoCodes(props.segmentId, attachPayload)
    }

    if (s.pendingDetach.length > 0) {
      const detachPayload = {
        promo_code_ids: s.pendingDetach,
        auto_apply: true,
      }

      await detachPromoCodes(props.segmentId, detachPayload)

    }

    emit('updated')


  } catch (e) {
    console.error(e)
  }

}

</script>