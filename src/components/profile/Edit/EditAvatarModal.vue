<template>
  <DialogModal
      title="Редактировать аватарку"
      :key="renderModal"
  >

    <template #button>
      <slot name="content"/>
    </template>

    <template #content>

      <EditAvatar
          @updated="renderModal++"
      />

    </template>
  </DialogModal>
</template>

<script setup lang="ts">
import DialogModal from "@/components/dynamics/shadcn/DialogModal.vue";
import EditAvatar from "@/components/profile/Edit/EditAvatar.vue";
import {ref} from "vue";

const renderModal = ref(1)

</script>

<style scoped>

</style>