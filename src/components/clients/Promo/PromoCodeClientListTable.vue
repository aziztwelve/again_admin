<template>
  <DynamicsDataTable
      :key="renderTable"
      :data="props.items"
      :columns="columns"
      :custom-actions="true"
  >

    <template #actions="{row}">

      <AlertDialog
          description="Вы уверены, что хотите отозвать этот купон у клиента?"
          icon-style="text-red-400 hover:text-red-600"
          :title="`Отозвать купон у клиента ${client?.name ?  client?.name : client?.email}`"
          :show-icon="true"
          :icon-size="23"
          :icon="CircleX"
          @continue="() => handleRemove(row.original)"
      />

    </template>

  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {h, PropType, ref} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {Check, CircleX, X} from 'lucide-vue-next';
import {useDateFormat} from "@/composables/useDateFormat";
import {PromoCodeClient} from "@/models/PromoCodeClient";
import AlertDialog from "@/components/dynamics/AlertDialog.vue";
import {Client} from "@/models/client/Client";
import {usePromoCodeClientFunctions} from "@/composables/usePromoCodeClientFunctions";

const props = defineProps({
  items: {
    type: Array as PropType<PromoCodeClient[]>,
    default: []
  },
  client: Client,
});

const emits = defineEmits(["deleted"]);


const renderTable = ref(1)

const {deletePromoCodeClient} = usePromoCodeClientFunctions();
const {formatDateToRussian} = useDateFormat();

const handleRemove = async (item: PromoCodeClient) => {
  if (item.id) {
    const success = await deletePromoCodeClient(item.id)
    if (success) {
      emits('deleted', item)
    }
  }
}


const columns = [
  {
    accessorKey: "promoCode.id",
    header: "ID",
  },
  {
    accessorKey: "promoCode.code",
    header: "Код",
  },

  {
    accessorKey: "promoCode.image",
    header: "Картинка",
    cell: ({row}: any) => {
      const url = row.original.promoCode.getImageURL();
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
    accessorKey: "promoCode.discountTypeLabel",
    header: "Тип скидки",
  },
  {
    accessorKey: "promoCode.formattedValue",
    header: "Значение",
  },
  {
    accessorKey: ".promoCodes.tartsAt",
    header: "Начало",
    cell: ({row}: any) => formatDateToRussian(row.original?.promoCode?.startsAt)
  },
  {
    accessorKey: "expiresAt",
    header: "Окончание",
    cell: ({row}: any) => formatDateToRussian(row.original?.promoCode.expiresAt)
  },
  {
    accessorKey: "promoCode.maxUses",
    header: "Макс. использований",
  },
  {
    accessorKey: "promoCode.timesUsed",
    header: "Использовано",
  },
  {
    accessorKey: "promoCode.description",
    header: "Описание",
  },

  {
    accessorKey: "promoCode.isActive",
    header: "Активен",
    cell: ({row}: any) => {
      return row.original?.promoCode?.isActive
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },
];
</script>

<style scoped></style>
