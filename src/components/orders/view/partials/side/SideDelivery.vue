<template>
  <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-900">Доставка</h3>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        :disabled="saving"
        @click="openEdit"
      >
        <Pencil class="mr-1 h-3.5 w-3.5" />
        Изменить
      </Button>
    </div>
    <dl class="mt-3 space-y-2 text-sm">
      <div>
        <dt class="text-xs uppercase text-gray-500">Получатель</dt>
        <dd class="text-gray-900">{{ recipientName || "—" }}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase text-gray-500">Телефон</dt>
        <dd class="text-gray-900">{{ recipientPhone || "—" }}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase text-gray-500">Адрес</dt>
        <dd class="text-gray-900">{{ address }}</dd>
      </div>
    </dl>

    <div v-if="isYandexDelivery" class="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm">
      <div class="font-medium text-yellow-900">Яндекс.Доставка</div>
      <div class="mt-1 text-yellow-800">
        {{ yandexOrder?.internal_status ? yandexStatusLabel(yandexOrder.internal_status) : 'Заявка ещё не создана' }}
      </div>
      <div v-if="yandexOrder?.claim_id" class="mt-1 break-all text-xs text-yellow-700">
        Трек-номер: {{ yandexOrder.claim_id }}
      </div>
      <a v-if="yandexOrder?.tracking_url" :href="yandexOrder.tracking_url" target="_blank" rel="noopener noreferrer" class="mt-2 inline-block text-xs font-medium underline">
        Открыть отслеживание
      </a>
      <div class="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" :disabled="yandexLoading" @click="createOrSyncYandex">
          {{ yandexOrder?.claim_id ? 'Обновить статус' : 'Создать заявку' }}
        </Button>
        <Button v-if="yandexOrder?.claim_id" variant="destructive" size="sm" :disabled="yandexLoading" @click="cancelYandex">
          Отменить доставку
        </Button>
      </div>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="flex max-h-[95vh] w-full flex-col overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Редактирование доставки</DialogTitle>
          <DialogDescription>
            Заполните любые поля — необязательные оставьте пустыми. Сохранены будут
            переданные значения.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-6">
          <div class="-mx-4 px-4 py-6 ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-6">
            <h3 class="text-sm/6 font-medium text-gray-900">Способ доставки</h3>
            <div class="mt-3">
              <Label for="side_delivery_method">Способ доставки</Label>
              <Select
                id="side_delivery_method"
                v-model="draftDeliveryMethodId"
                :options="deliveryMethodOptions"
                option-label="name"
                option-value="id"
                placeholder="Выберите способ доставки"
                searchable
                search-placeholder="Поиск по способам доставки..."
              />
            </div>
          </div>

          <OrderRecipientDetails v-model:recipient="draftRecipient" />

          <OrderDeliveryDetails v-model:delivery-address="draftAddress" />
        </div>

        <DialogFooter class="gap-2 sm:gap-2">
          <Button
            variant="outline"
            type="button"
            :disabled="saving"
            @click="dialogOpen = false"
          >
            Отмена
          </Button>
          <Button
            variant="default"
            type="button"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? "Сохранение..." : "Сохранить" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { Pencil } from "lucide-vue-next";

import Button from "@/components/ui/button/Button.vue";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Select from "@/components/dynamics/Dropdown/Select.vue";
import OrderRecipientDetails from "@/components/orders/create/OrderRecipientDetails.vue";
import OrderDeliveryDetails from "@/components/orders/create/OrderDeliveryDetails.vue";

const props = defineProps({
  order: { type: Object, required: true },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["save", "refresh"]);

const dialogOpen = ref(false);
const deliveryMethodOptions = ref([]);

const addressObj = computed(() => props.order?.delivery_address || null);
const isYandexDelivery = computed(() => String(props.order?.delivery_method?.code || props.order?.deliveryMethod?.code || '').startsWith('yandex_'));
const yandexOrder = computed(() => props.order?.yandex_order || props.order?.yandexOrder || null);
const yandexLoading = ref(false);

const yandexStatusLabel = (status) => ({
  created: 'Заявка создана', courier_assigned: 'Курьер назначен', picked_up: 'Заказ передан в доставку',
  delivered: 'Заказ доставлен', returning: 'Оформляется возврат', cancelled: 'Доставка отменена', failed: 'Ошибка доставки',
}[status] || status);

const createOrSyncYandex = async () => {
  yandexLoading.value = true;
  try {
    await axios.post(`/orders/${props.order.id}/yandex-delivery/create`);
    emit('refresh');
  } finally {
    yandexLoading.value = false;
  }
};

const cancelYandex = async () => {
  if (!window.confirm('Отменить заявку в Яндекс.Доставке?')) return;
  yandexLoading.value = true;
  try {
    await axios.post(`/orders/${props.order.id}/yandex-delivery/cancel`);
    emit('refresh');
  } finally {
    yandexLoading.value = false;
  }
};

const recipientName = computed(() => {
  const a = addressObj.value;
  if (!a) return null;
  return [a.recipient_last_name, a.recipient_first_name, a.recipient_middle_name]
    .filter(Boolean)
    .join(" ");
});

const recipientPhone = computed(() => addressObj.value?.recipient_phone || null);

const address = computed(() => {
  const a = addressObj.value;
  if (!a) return "—";
  return [a.country, a.region, a.city, a.address].filter(Boolean).join(", ") || "—";
});

const deliveryMethodId = computed(
  () =>
    props.order?.delivery_method?.id ||
    props.order?.deliveryMethod?.id ||
    props.order?.delivery_method_id ||
    null,
);

const createEmptyAddress = () => ({
  country: "",
  region: "",
  city: "",
  postal_code: "",
  address: "",
  entrance: "",
  floor: "",
  intercom: "",
  delivery_comment: "",
  delivery_date: "",
  buyer_comment: "",
});

const createEmptyRecipient = () => ({
  first_name: "",
  last_name: "",
  middle_name: "",
  phone: "",
});

const draftAddress = ref(createEmptyAddress());
const draftRecipient = ref(createEmptyRecipient());
const draftDeliveryMethodId = ref(null);

const formatDateTimeLocal = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fetchDeliveryMethods = async () => {
  try {
    const { data } = await axios.get("/delivery/methods/admin", {
      params: { active: 1 },
    });
    const items = Array.isArray(data?.data) ? data.data : [];
    deliveryMethodOptions.value = items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      code: item.delivery_type_code ?? item.code ?? null,
    }));
  } catch {
    deliveryMethodOptions.value = [];
  }
};

const openEdit = () => {
  const a = props.order?.delivery_address || {};
  const empty = createEmptyAddress();
  draftAddress.value = {
    country: a.country || empty.country,
    region: a.region || empty.region,
    city: a.city || empty.city,
    postal_code: a.postal_code || empty.postal_code,
    address: a.address || props.order?.delivery_target?.name || empty.address,
    entrance: a.entrance || empty.entrance,
    floor: a.floor || empty.floor,
    intercom: a.intercom || empty.intercom,
    delivery_comment: a.delivery_comment || empty.delivery_comment,
    buyer_comment: a.buyer_comment || empty.buyer_comment,
    delivery_date: formatDateTimeLocal(
      a.delivery_date || props.order?.delivery_date,
    ),
  };

  const client = props.order?.client || {};
  const profile = client?.profile || {};
  draftRecipient.value = {
    first_name:
      a.recipient_first_name || profile.first_name || client.first_name || "",
    last_name:
      a.recipient_last_name || profile.last_name || client.last_name || "",
    middle_name: a.recipient_middle_name || profile.middle_name || "",
    phone: a.recipient_phone || profile.phone || client.phone || "",
  };

  draftDeliveryMethodId.value = deliveryMethodId.value;
  dialogOpen.value = true;
};

const save = () => {
  emit("save", {
    recipient: { ...draftRecipient.value },
    delivery_address: { ...draftAddress.value },
    delivery_date: draftAddress.value.delivery_date || null,
    delivery_method_id: draftDeliveryMethodId.value || null,
    onSuccess: () => {
      dialogOpen.value = false;
    },
  });
};

onMounted(() => {
  fetchDeliveryMethods();
});
</script>
