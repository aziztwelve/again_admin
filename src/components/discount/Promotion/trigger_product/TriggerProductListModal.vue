<template>
  <div>
    <DialogModal
      ref="dialogRef"
      dynamic-style="min-w-[85vw]"
      title="Выбрать товары-триггеры"
      description="Выберите товары, на которые будет действовать акция"
    >
      <template #button>
        <Button variant="outline" type="button">
          <Plus class="pr-1" />
          Добавить товары
        </Button>
      </template>

      <template #content>
        <TriggerProductList
          :selected="selected"
          @addToSelectList="emits('addToSelectList', $event)"
          @close="dialogRef?.closeModal()"
        />
      </template>
    </DialogModal>
  </div>
</template>

<script setup lang="ts">
import DialogModal from "@/components/dynamics/shadcn/DialogModal.vue";
import Button from "@/components/ui/button/Button.vue";
import { Plus } from "lucide-vue-next";
import TriggerProductList from "@/components/discount/Promotion/trigger_product/TriggerProductList.vue";
import { PropType, ref } from "vue";
import type { SelectedVariantsMap } from "@/components/discount/Promotion/product_picker/types";

const emits = defineEmits(["addToSelectList"]);
const dialogRef = ref<InstanceType<typeof DialogModal> | null>(null);

const props = defineProps({
  selected: {
    type: Object as PropType<SelectedVariantsMap>,
    default: () => ({}),
  },
});
</script>

<style scoped></style>
