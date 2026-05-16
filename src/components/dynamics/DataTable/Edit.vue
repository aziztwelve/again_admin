<template>
  <Dialog v-model:open="dialogOpen">
    <DialogTrigger as-child :disabled="true">

      <button
          :disabled="disabled"
          aria-disabled="true"
          class="inline-flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-500"
      >
        <Pencil size="17"/>
      </button>

    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px] max-h-full overflow-y-auto" :class="edit?.dynamicStyle">
      <DialogHeader>
        <DialogTitle>{{ edit?.title }}</DialogTitle>
        <DialogDescription>
          {{ edit.description }}
        </DialogDescription>
      </DialogHeader>

      <component
          :key="renderContent"
          :is="edit.component"
          :item="editItem"
      />

      <DialogFooter>
        <Button type="button" variant="outline" @click="closeDialog">
          Отменить
        </Button>
        <Button
            type="submit"
            @click="saveChanges"
            :disabled="edit?.loader"
        >
          <Loader2 class="w-4 h-4 mr-2 animate-spin" v-if="edit.loader"/>
          Сохранить
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import {Pencil, Loader2} from "lucide-vue-next";
import {ref, watch} from "vue"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import cloneDeep from 'lodash/cloneDeep'


const props = defineProps({
  edit: Object,
  item: Object,
  disabled: {
    type: Boolean,
    default: false
  },
});


const editItem = ref(cloneDeep(props.item))
const emits = defineEmits(["save_changes"]);

const dialogOpen = ref(false);
const renderContent = ref(1);


const closeDialog = () => {
  dialogOpen.value = false;
};

const saveChanges = () => {
  emits('save_changes', editItem.value);
  closeDialog();
  renderContent.value++;
};


watch(dialogOpen, (isOpen) => {
  if (isOpen) {
    editItem.value = cloneDeep(props.item)
  }
})

</script>

<style scoped></style>