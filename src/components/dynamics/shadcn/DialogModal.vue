<template>
  <Dialog v-model:open="dialogOpen">
    <button type="button" :disabled="disabled">
      <DialogTrigger as-child>
        <slot name="button" />
      </DialogTrigger>
    </button>
    <DialogContent
      :class="dynamicStyle"
      class="w-full max-h-[95vh] overflow-y-auto flex flex-col items-start"
    >
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>
          {{ description || " " }}
        </DialogDescription>
      </DialogHeader>

      <div class="w-full">
        <slot name="content" />
      </div>

      <DialogFooter>
        <slot name="footer" />
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ref, watch } from "vue";

const props = defineProps({
  title: String,
  description: {
    type: String,
    default: "",
  },
  dynamicStyle: String,
  disabled: Boolean,
});

const dialogOpen = ref(false);

const emit = defineEmits(["dialogOpen"]);

watch(
  () => dialogOpen.value,
  (newValue) => {
    if (newValue) {
      emit("dialogOpen", dialogOpen.value);
    }
  },
);

const closeModal = () => {
  dialogOpen.value = false;
};

defineExpose({
  closeModal,
  openModal: () => (dialogOpen.value = true),
});
</script>
