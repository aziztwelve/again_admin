<template>
  <ModalDialog
      ref="modalDialog"
      title="Добавить клиента в сегмент"
      dynamic-style="md:min-w-[80%] max-md:max-w-full"
  >
    <template #trigger>
      <Button variant="ghost" size="icon" class="h-6 w-6 ">
        <Plus class="h-4 w-4"/>
      </Button>
    </template>

    <template #content>
      <!-- Select existing tag -->
      <div class="space-y-2">
        <Label>Выберите существующий сегмент</Label>
        <div class=" flex items-center gap-2 w-full">
          <ChatClientSegmentList
              :client="client"
              @added-client-to-segment="closeModal()"
              @deleted-client-to-segment="closeModal()"
          />
        </div>
      </div>
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import ModalDialog from "@/components/dynamics/shadcn/ModalDialog.vue";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Plus} from "lucide-vue-next";
import {Client} from "@/types/client";
import {ref} from "vue";
import ChatClientSegmentList from "@/components/dialogs/chats/Client/Segment/ChatClientSegmentList.vue";

interface Props {
  client: Client
}
defineProps<Props>()


const modalDialog = ref<{
  close: () => void
} | null>(null)

const closeModal = () => {
  modalDialog.value?.close()
}


</script>