<template>
  <DynamicsDataTable
      :data="items"
      :columns="columns"
      :custom-actions="false"
      :edit="edit"
      @save_changes="handleUpdate"
      @deleted="deletePromoCodeHandle"
  >
    <template #addActions="{ item }">
      <Copy
          class="cursor-pointer text-gray-400 hover:text-blue-600 transition"
          :size="17"
          title="Создать копию"
          @click="duplicatePromoCodeHandle(item)"
      />
    </template>
  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {h, PropType, ref} from "vue";
import {useRouter} from "vue-router";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {Check, X, Copy} from 'lucide-vue-next';
import {PromoCode} from "@/models/PromoCode";
import {usePromoCodeFunctions} from "@/composables/usePromoCodeFunctions";
import {useDateFormat} from "@/composables/useDateFormat";
import PromoEdit from "@/components/discount/Promo/PromoEdit.vue";
import {getCustomerTypeLabel, getDiscountTargetLabel} from "@/constants/DiscountType";

const props = defineProps({
  items: {
    type: Array as PropType<PromoCode[]>,
    default: []
  },
  loading: Boolean,
});

const edit = ref({
  title: "Редактирование промокода",
  description: "Измените параметры промокода, включая код, скидку, срок действия и статус",
  component: PromoEdit,
  dynamicStyle: "2xl:min-w-[50vw] xl:min-w-[65vw] max-md:min-w-full md:min-w-[95vw]",
  loader: false,
});

const emits = defineEmits(["deleted", "updated"]);

const {deletePromoCode, updatePromoCode} = usePromoCodeFunctions();
const {duplicatePromoCode} = usePromoCodeFunctions();
const {formatDateToRussian} = useDateFormat();

const router = useRouter();

const openPromoOrders = (promoCode: PromoCode) => {
  router.push({
    path: '/orders/list',
    query: {
      promo_code_id: promoCode.id,
      promo_code: promoCode.code,
    },
  });
};

const deletePromoCodeHandle = async (promo: PromoCode) => {
  if (promo.id) {
    const success = await deletePromoCode(promo.id);
    if (success) {
      emits('deleted', promo);
    }
  }
};

const duplicatePromoCodeHandle = async (promo: PromoCode) => {
  if (promo.id) {
    const success = await duplicatePromoCode(promo.id);
    if (success) {
      emits('updated', promo);
    }
  }
};

const handleUpdate = async (item: PromoCode) => {

  const success = await updatePromoCode(item);

  if (success) {
    emits('updated', item);
  }
}


const columns = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "code",
    header: "Код",
  },

  {
    accessorKey: "image",
    header: "Картинка",
    cell: ({row}: any) => {
      const url = row.original.getImageURL();
      return url
          ? h(
              "img",
              {
                src: url,
                alt: row.original.title ?? "image",
                style: "height: 40px; object-fit: contain; cursor: pointer;",
                onClick: () => {
                  window.open(url, "_blank");
                },
              }
          )
          : "-";
    },
  },

  {
    accessorKey: "discountTypeLabel",
    header: "Тип скидки",
  },
  {
    accessorKey: "formattedValue",
    header: "Значение",
  },
  {
    accessorKey: "startsAt",
    header: "Начало",
    cell: ({row}: any) => formatDateToRussian(row.original.startsAt)
  },
  {
    accessorKey: "expiresAt",
    header: "Окончание",
    cell: ({row}: any) => formatDateToRussian(row.original.expiresAt)
  },
  {
    accessorKey: "maxUses",
    header: "Макс. использований",
  },
  {
    accessorKey: "timesUsed",
    header: "Использован",
    cell: ({row}: any) => {
      const timesUsed = Math.max(0, Number(row.original.timesUsed) || 0)

      return h(
          "button",
          {
            onClick: () => openPromoOrders(row.original),
            class: "text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium transition-colors",
            title: "Открыть заказы с этим промокодом",
          },
          `Использован ${timesUsed} раз(а)`,
      );
    },
  },
  {
    accessorKey: "description",
    header: "Описание",
  },
  {
    accessorKey: "promo_code_type",
    header: "Применить",
    cell: ({row}: any) => {
      return getDiscountTargetLabel(row.original.promo_code_type);
    }
  },
  {
    accessorKey: "customerType",
    header: "Аудитория",
    cell: ({row}: any) => getCustomerTypeLabel(row.original.customerType)
  },

  {
    accessorKey: "is_unlimited",
    header: "Без бессрочный",
    cell: ({row}: any) => {
      return row.original.is_unlimited
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },

  {
    accessorKey: "applies_to_all_clients",
    header: "Ко всем клиентам",
    cell: ({row}: any) => {
      return row.original.applies_to_all_clients
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },
  {
    accessorKey: "template_type",
    header: "ДР Промокод",
    cell: ({row}: any) => {
      return row.original.template_type
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },

  {
    accessorKey: "isActive",
    header: "Активен",
    cell: ({row}: any) => {
      return row.original.isActive
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },
];
</script>

<style scoped></style>
