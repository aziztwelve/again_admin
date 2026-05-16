<template>
  <DynamicsDataTable
      :data="items"
      :columns="columns"
      :custom-actions="true"
  >

    <template #actions="{row}">

      <AlertDialog
          v-if="!promoCodeClientIds?.includes(row.original?.id)"
          description="Вы уверены, что хотите добавить этот купон выбранному клиенту?"
          icon-style="text-green-400 hover:text-green-600"
          :title="`Добавить купон клиенту ${client?.profile?.first_name ? client?.profile.first_name + ' ' + client?.profile.last_name : client?.email}`"
          :show-icon="true"
          :icon-size="23"
          :icon="CircleCheckBig"
          @continue="() => handleAdd(row.original)"
      />

      <div v-else class="flex items-center gap-2 text-green-500">
        <CircleCheckBig :size="20"/>
        <span>Купон назначен</span>
      </div>

    </template>

  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {h, PropType, ref} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {Check, X, CircleCheckBig} from 'lucide-vue-next';
import {PromoCode} from "@/models/PromoCode";
import {useDateFormat} from "@/composables/useDateFormat";
import AlertDialog from "@/components/dynamics/AlertDialog.vue"
import {Client} from "@/models/client/Client";
import {usePromoCodeClientFunctions} from "@/composables/usePromoCodeClientFunctions";
import {PromoCodeClient} from "@/models/PromoCodeClient";

const props = defineProps({
  items: {
    type: Array as PropType<PromoCode[]>,
    default: []
  },
  client: Client,
  promoCodeClientIds: Array,
  loading: Boolean,
});


const emits = defineEmits(["created"]);

const {createPromoCodeClient, deletePromoCodeClient} = usePromoCodeClientFunctions();
const {formatDateToRussian} = useDateFormat();


const handleAdd = async (item: PromoCode) => {

  if (item.id && props.client?.id) {
    const success = await createPromoCodeClient({
      promo_code_id: item.id,
      client_id: props.client?.id
    });

    if (success) {

      if (!props.promoCodeClientIds?.includes(success.promoCode?.id)) {
        props.promoCodeClientIds?.push(success.promoCode?.id);
      }

      emits('created', success);
    }
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
    header: "Использовано",
  },
  {
    accessorKey: "description",
    header: "Описание",
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
