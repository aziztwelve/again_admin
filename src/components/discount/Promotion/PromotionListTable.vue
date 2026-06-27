<template>
  <DynamicsDataTable :data="items" :columns="columns" :custom-actions="true">
    <template #actions="{ row }">
      <PromotionEditModal
        :key="row.original.id"
        :promotion="row.original"
        @update="emits('updated')"
      />

      <IconButtons
        :buttons="[
          { type: 'copy', onClick: duplicatePromotionHandle, class: 'text-gray-400 hover:text-blue-600' },
          { type: 'delete', onClick: deletePromotionHandle }
        ]"
        :context="row.original"
      />
    </template>
  </DynamicsDataTable>
</template>

<script setup lang="ts">
import { h, PropType } from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import { Check, X } from "lucide-vue-next";
import IconButtons from "@/components/dynamics/IconButtons.vue";
import { Promotion } from "@/models/Promotion";
import { useDateFormat } from "@/composables/useDateFormat";
import PromotionEditModal from "@/components/discount/Promotion/PromotionEditModal.vue";
import { usePromotionFunctions } from "@/composables/usePromotionFunctions";

const props = defineProps({
  items: {
    type: Array as PropType<Promotion[]>,
    default: [],
  },
  loading: Boolean,
});

const emits = defineEmits(["deleted", "updated"]);

const { deletePromotion } = usePromotionFunctions();

const deletePromotionHandle = async (promotion: Promotion) => {
  if (promotion.id) {
    const success = await deletePromotion(promotion.id);
    if (success) {
      emits("deleted", promotion);
    }
  }
};

const { duplicatePromotion } = usePromotionFunctions();

const duplicatePromotionHandle = async (promotion: Promotion) => {
  if (promotion.id) {
    const success = await duplicatePromotion(promotion.id);
    if (success) {
      emits("updated");
    }
  }
};

const columns = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Название",
  },
  {
    accessorKey: "description",
    header: "Описание",
  },
  {
    accessorKey: "min_purchase_amount",
    header: "Мин. сумма",
    cell: ({ row }: any) =>
      row.original.minPurchaseAmount
        ? `${row.original.minPurchaseAmount}₽`
        : "-",
  },
  {
    accessorKey: "starts_at",
    header: "Начало",
    cell: ({ row }: any) => formatDateToRussian(row.original.startsAt),
  },
  {
    accessorKey: "ends_at",
    header: "Окончание",
    cell: ({ row }: any) => formatDateToRussian(row.original.endsAt),
  },
  {
    accessorKey: "times_used",
    header: "Использовано",
    cell: ({ row }: any) => row.original.usageLabel,
  },
  {
    accessorKey: "is_active",
    header: "Активна",
    cell: ({ row }: any) => {
      return row.original.isActive
        ? h(Check, { class: "h-4 w-4 text-green-500" })
        : h(X, { class: "h-4 w-4 text-red-500" });
    },
  },
  {
    accessorKey: "allow_promo_codes",
    header: "Промокоды",
    cell: ({ row }: any) => {
      return row.original.allowPromoCodes
        ? h(Check, { class: "h-4 w-4 text-green-500" })
        : h(X, { class: "h-4 w-4 text-red-500" });
    },
  },
  {
    accessorKey: "is_stackable",
    header: "Стекируется",
    cell: ({ row }: any) => {
      return row.original.isStackable
        ? h(
            "span",
            {
              class:
                "inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700",
              title:
                "Акция суммируется с другими суммируемыми акциями (накопительные подарки)",
            },
            "Стекируется",
          )
        : h(X, { class: "h-4 w-4 text-gray-300" });
    },
  },
];

const { formatDateToRussian } = useDateFormat();
</script>

<style scoped></style>
