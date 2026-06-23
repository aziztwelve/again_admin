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
          :selectedList="selectedList"
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

const emits = defineEmits(["addToSelectList"]);
const dialogRef = ref<InstanceType<typeof DialogModal> | null>(null);

const props = defineProps({
  selectedList: {
    type: Array as PropType<number[]>,
    default: () => [],
  },
});
</script>

<style scoped></style>
