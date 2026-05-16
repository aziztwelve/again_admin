<template>
  <ModalDialog
      ref="modalDialog"
      title="Выберите менеджера"
  >
    <template #trigger>
      <div class="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition">
        <span v-if="managerName" class=" text-blue-400">{{ managerName }}</span>
        <span v-else class="text-blue-400  underline-offset-1">Выбрать</span>
      </div>
    </template>

    <template #content>
      <DynamicSelect
          v-model="selectManId"
          :options="users"
          option-label="full_name"
          option-value="id"
          placeholder="Выберите менеджера"
      />
    </template>

    <template #footer>
      <Button type="button" variant="outline" @click="modalDialog?.close">
        Отменить
      </Button>
      <Button type="submit" @click="attach" :disabled="sending">
        <Loader2 class="w-4 h-4 mr-2 animate-spin" v-if="sending"/>
        Сохранить
      </Button>
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import ModalDialog from "@/components/dynamics/shadcn/ModalDialog.vue"
import DynamicSelect from "@/components/dynamics/Dropdown/Select.vue"
import {Loader2,} from "lucide-vue-next";
import {ref, watch} from "vue";
import {Button} from "@/components/ui/button";
import {useContactRequestFunctions} from "@/composables/useContactRequestFunctions";

interface Props {
  contactRequestId: number
  managerId?: number
  managerName?: string
  users: any[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const {attachManager, sending} = useContactRequestFunctions()

const selectManId = ref(props.managerId)

// Следим за изменением managerId (если обновляется извне)
watch(() => props.managerId, (newVal) => {
  selectManId.value = newVal
})

const modalDialog = ref<{
  close: () => void
} | null>(null)

const attach = async () => {
  try {
    const res = await attachManager(
        props.contactRequestId,
        selectManId.value ?? null
    )

    if (res) {
      modalDialog.value?.close()
      emit('updated')
    }
  } catch (e) {
    console.error(e)
  }
}
</script>