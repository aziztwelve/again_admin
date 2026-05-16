<template>
  <ModalDialog
      ref="modal"
      title="Переотправить карту"
      description="Выберите канал доставки и укажите контактные данные"
  >

    <template #trigger>
      <button
          @click=""
          class="inline-flex items-center justify-center cursor-pointer text-gray-400 hover:text-green-500"
          title="Переотправить карту"
      >
        <Send :size="17"/>
      </button>
    </template>


    <template #content>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="delivery-channel">Канал доставки</Label>
          <Select v-model="resendData.delivery_channel">
            <SelectTrigger id="delivery-channel">
              <SelectValue placeholder="Выберите канал"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div v-if="resendData.delivery_channel === 'email'" class="grid gap-2">
          <Label for="recipient-email">Email получателя</Label>
          <Input
              id="recipient-email"
              v-model="resendData.recipient_email"
              type="email"
              placeholder="email@example.com"
          />
        </div>

        <div v-if="resendData.delivery_channel === 'whatsapp' || resendData.delivery_channel === 'sms'"
             class="grid gap-2">
          <Label for="recipient-phone">Телефон получателя</Label>
          <Input
              id="recipient-phone"
              v-model="resendData.recipient_phone"
              type="tel"
              placeholder="+7 (xxx) xxx-xx-xx"
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
          @click="handleResend(giftCard, resendData)"
      >
        Отправить
      </Button>
    </template>

  </ModalDialog>
</template>
<script setup lang="ts">
import {Send} from "lucide-vue-next"
import type {GiftCard, ResendGiftCardRequest} from "@/features/gift-card/types";
import ModalDialog from "@/components/dynamics/shadcn/ModalDialog.vue";
import {Button} from "@/components/ui/button";
import {onMounted, ref} from "vue";
import {Label} from "@/components/ui/label";
import {useGiftCards} from "@/features/gift-card/composables/useGiftCards";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Input} from "@/components/ui/input";

interface Props {
  giftCard: GiftCard;
}

const props = defineProps<Props>()

const {resendGiftCard, sending} = useGiftCards()

const resendData = ref<ResendGiftCardRequest>({
  delivery_channel: 'email',
  recipient_email: '',
  recipient_phone: '',
})

const modal = ref<{
  close: () => void
} | null>(null)


const handleResend = async (giftCard: GiftCard, resendData: ResendGiftCardRequest) => {
  if (!giftCard.id) return

  try {
    await resendGiftCard(giftCard.id, resendData)
    modal.value?.close
  } catch (e) {
    console.error('Failed to resend gift card:', e)
  }
}

onMounted(() => {
  resendData.value.recipient_email = props.giftCard.recipient_email ?? ''
  resendData.value.recipient_phone = props.giftCard.recipient_phone ?? ''
})

</script>
<style scoped>

</style>