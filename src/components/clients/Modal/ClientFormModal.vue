<template>
  <ModalDialog
      ref="modalDialog"
      dynamic-style="md:min-w-[50%]"
  >
    <template #trigger>
      <Button variant="outline" size="xs">

        <component :is="iconComponent" v-if="iconComponent" />
        <span v-else>
        {{ props.buttonName || 'Создать клиента' }}
        </span>
      </Button>
    </template>

    <template #content>
      <ClientForm
          :form-data="formData"
          :submit-button-text="submitButtonText ?? 'Создать'"
          @submit-form="emit('submitForm')"
      />
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import ModalDialog from "@/components/dynamics/shadcn/ModalDialog.vue"
import ClientForm from "@/components/clients/From/ClientForm.vue"
import {ClientFormData} from "@/types/client"
import {Button} from "@/components/ui/button"
import {Pencil, Plus} from "lucide-vue-next";
import {computed, ref} from "vue";

type ButtonIconType = 'pencil' | 'plus'

interface ClientFormModalProps {
  formData: ClientFormData
  buttonName?: string
  buttonIcon?: ButtonIconType
  submitButtonText?: string
}

const props = defineProps<ClientFormModalProps>()

const emit = defineEmits<{
  submitForm: []
}>()


const modalDialog = ref<{
  close: () => void
} | null>(null)

const iconMap = {
  pencil: Pencil,
  plus: Plus,
} as const

const iconComponent = computed(() =>
    props.buttonIcon ? iconMap[props.buttonIcon] : null
)

const closeModal = () => {
  modalDialog.value?.close()
}

defineExpose({closeModal})
</script>