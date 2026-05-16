<template>
  <ModalDialog
      :title="client?.name ? 'Клиент : ' + client.name : 'Клиент : ' + client?.email"
      description="Чтобы убрать промокод у клиента, нажмите на иконку X"
      dynamic-style="2xl:min-w-[85vw] xl:min-w-[90vw] max-md:min-w-full md:min-w-[95vw]"
  >
    <template #trigger>
      <Tickets :size="17" class="text-gray-400 hover:text-gray-700"/>
    </template>

    <template #content>
      <PromoCodeClientList
          :client="client"
      />
    </template>

  </ModalDialog>

</template>


<script setup lang="ts">
import ModalDialog from "@/components/dynamics/shadcn/ModalDialog.vue";
import {Tickets} from "lucide-vue-next"
import {Client} from "@/models/client/Client";
import PromoCodeClientList from "@/components/clients/Promo/PromoCodeClientList.vue";

const props = defineProps({
  client: Client
})

</script>


<style scoped>

</style>