<template>
  <DialogModal
      ref="dialogRef"
      dynamic-style="min-w-[85vw]"
      title="Выбрать товары"
      description="Отметьте товары из онлайн-каталога. Товары без остатка помечены тегом."
  >
    <template #button>
      <Button variant="outline" type="button">
        <Plus class="pr-1"/>
        Выбрать товары
      </Button>
    </template>

    <template #content>
      <CategoryProductSelectList
          :selected-ids="selectedIds"
          @update:selected-ids="emits('update:selectedIds', $event)"
          @done="dialogRef?.closeModal()"
      />
    </template>
  </DialogModal>
</template>

<script setup lang="ts">
import {PropType, ref} from "vue";
import DialogModal from "@/components/dynamics/shadcn/DialogModal.vue";
import Button from "@/components/ui/button/Button.vue";
import {Plus} from "lucide-vue-next";
import CategoryProductSelectList from "@/components/category/product_select/CategoryProductSelectList.vue";

defineProps({
  selectedIds: {
    type: Array as PropType<number[]>,
    default: () => [],
  },
});

const emits = defineEmits<{
  (e: "update:selectedIds", ids: number[]): void;
}>();

const dialogRef = ref<InstanceType<typeof DialogModal> | null>(null);
</script>
