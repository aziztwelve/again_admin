<template>
  <section class="flex flex-wrap items-center gap-2 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
    <OrderPositionModal
      v-model="productSearch"
      :products="products"
      @select="onAddPosition"
    />
    <PromoCodeListModal
      trigger-label="Купон"
      :client-id="order.client?.id ?? order.client_id ?? null"
      @select="onCouponSelect"
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
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { Printer, Mail } from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";
import OrderPositionModal from "@/components/orders/modals/OrderPositionModal.vue";
import PromoCodeListModal from "@/components/orders/modals/PromoCodeListModal.vue";
import OrderChat from "@/components/orders/view/partials/OrderChat.vue";
import { useProductFunctions } from "@/composables/useProductFunctions";
import { useToast } from "@/components/ui/toast/use-toast";

const props = defineProps({
  order: { type: Object, required: true },
});

const emit = defineEmits(["add-position", "coupon-select"]);

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

const { getProducts: getProductsFromApi } = useProductFunctions();
const productSearch = ref("");
const products = ref([]);

const normalizeProductsResponse = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.products)) return response.products;
  return [];
};

const fetchProducts = async (search = "") => {
  const response = await getProductsFromApi({
    per_page: 50,
    paginate: false,
    admin: true,
    search: search || undefined,
  });
  products.value = normalizeProductsResponse(response);
};

onMounted(() => fetchProducts());

watch(productSearch, (value) => fetchProducts(value));

const onAddPosition = (payload) => {
  // Модалка теперь отдаёт {product, variant}; пробрасываем дальше как есть.
  const product = payload?.product ?? payload;
  if (!product?.id) return;
  emit("add-position", payload);
};

const onCouponSelect = (promoCode) => {
  if (!promoCode?.code) return;
  emit("coupon-select", promoCode);
};
</script>
