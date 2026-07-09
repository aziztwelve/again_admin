<template>
  <section class="flex flex-wrap items-center gap-2 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
    <OrderProductPickerModal @select="onAddPosition" />
    <PromoCodeListModal
      trigger-label="Промокод"
      :client-id="order.client?.id ?? order.client_id ?? null"
      @select="onCouponSelect"
    />
    <DiscountListModal
      trigger-label="Скидка"
      :client-id="order.client?.id ?? order.client_id ?? null"
      @select="onDiscountSelect"
    />
    <span class="ml-auto flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        type="button"
        :disabled="!order?.id"
        @click="onPrint"
      >
        <Printer class="mr-2 h-4 w-4" /> Печать
      </Button>
      <Button
        variant="outline"
        size="sm"
        type="button"
        :disabled="!clientEmail || isSendingEmail"
        :title="clientEmail ? `Отправить письмо на ${clientEmail}` : 'У клиента не указан email'"
        @click="onSendEmail"
      >
        <Mail class="mr-2 h-4 w-4" />
        {{ isSendingEmail ? "Отправка..." : "Письмо" }}
      </Button>
      <OrderChat :client-id="order.client?.id ?? order.client_id ?? null" />
    </span>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { Printer, Mail } from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";
import OrderProductPickerModal from "@/components/orders/modals/OrderProductPickerModal.vue";
import PromoCodeListModal from "@/components/orders/modals/PromoCodeListModal.vue";
import DiscountListModal from "@/components/orders/modals/DiscountListModal.vue";
import OrderChat from "@/components/orders/view/partials/OrderChat.vue";
import { useToast } from "@/components/ui/toast/use-toast";

const props = defineProps({
  order: { type: Object, required: true },
});

const emit = defineEmits(["add-position", "coupon-select", "discount-select"]);

const router = useRouter();
const { toast } = useToast();

const clientEmail = computed(() => props.order?.client?.email || "");

const onPrint = () => {
  const id = props.order?.id;
  if (!id) return;
  // router.resolve учитывает base ('/admin/'), поэтому открываем
  // с правильным префиксом — иначе nginx отдаёт 404 для /order/...
  const href = router.resolve({ name: "orders-print", params: { id } }).href;
  window.open(href, "_blank", "noopener");
};

const isSendingEmail = ref(false);

const onSendEmail = async () => {
  const id = props.order?.id;
  if (!id || !clientEmail.value || isSendingEmail.value) return;

  isSendingEmail.value = true;
  try {
    const { data } = await axios.post(`/orders/${id}/send-email`);
    toast({
      title: "Письмо отправлено",
      description: data?.message || `Письмо отправлено на ${clientEmail.value}`,
    });
  } catch (e) {
    const message =
      e?.response?.data?.message || "Не удалось отправить письмо";
    toast({
      title: "Ошибка отправки",
      description: message,
      variant: "destructive",
    });
  } finally {
    isSendingEmail.value = false;
  }
};

const onAddPosition = (payload) => {
  // Модалка отдаёт {product, variant} (вариант может быть null, если выбран
  // товар целиком). Пробрасываем дальше как есть — обработчики в OrderView
  // ожидают именно такой формат и сами решают, как добавлять позицию.
  const product = payload?.product ?? payload;
  if (!product?.id) return;
  emit("add-position", payload);
};

const onCouponSelect = (promoCode) => {
  if (!promoCode?.code) return;
  emit("coupon-select", promoCode);
};

const onDiscountSelect = (discount) => {
  if (!discount?.id) return;
  emit("discount-select", discount);
};
</script>
