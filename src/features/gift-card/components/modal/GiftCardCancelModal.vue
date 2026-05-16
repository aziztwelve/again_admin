<template>
  <ModalDialog
      ref="modal"
      title="Аннулировать карту"
      description="Укажите причину аннулирования подарочной карты"
  >
    <template #trigger>
      <button
          @click=""
          class="inline-flex items-center justify-center cursor-pointer text-gray-400 hover:text-red-500"
          title="Аннулировать карту"
      >
        <XCircle :size="17"/>
      </button>
    </template>


    <template #content>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="cancel-reason">Причина</Label>
          <Textarea
              id="cancel-reason"
              v-model="cancelReason"
              placeholder="Укажите причину аннулирования..."
              rows="3"
          />
        </div>
      </div>
    </template>


    <template #footer>
      <Button
          variant="outline"
          @click="modal?.close"
      >
        Отмена
      </Button>
      <Button
          :disabled="sending"
          variant="destructive"
          @click="handleCancel(giftCard, cancelReason)"
      >
        Аннулировать
      </Button>
    </template>

  </ModalDialog>
</template>
<script setup lang="ts">
import {XCircle} from "lucide-vue-next"
import type {CancelGiftCardRequest, GiftCard} from "@/features/gift-card/types";
import ModalDialog from "@/components/dynamics/shadcn/ModalDialog.vue";
import {Button} from "@/components/ui/button";
import {ref} from "vue";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {useGiftCards} from "@/features/gift-card/composables/useGiftCards";

interface Props {
  giftCard: GiftCard;
}

defineProps<Props>()

const emits = defineEmits<{
  (e: 'canceledEmit', giftCard: GiftCard): void
}>()

const {cancelGiftCard, sending} = useGiftCards()

const cancelReason = ref<string>("")

const modal = ref<{
  close: () => void
} | null>(null)


const handleCancel = async (giftCard: GiftCard, reason: string) => {
  if (!giftCard.id) return

  try {
    const cancelData: CancelGiftCardRequest = {reason}
    const updatedCard = await cancelGiftCard(giftCard.id, cancelData)

    if (updatedCard) {
      emits('canceledEmit', updatedCard)
      modal.value?.close
    }
  } catch (e) {
    console.error('Failed to cancel gift card:', e)
  }
}


</script>
<style scoped>

</style>