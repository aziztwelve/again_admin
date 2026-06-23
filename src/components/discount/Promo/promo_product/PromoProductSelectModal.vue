<template>
  <div>
    <DialogModal
      ref="dialogRef"
      dynamic-style="min-w-[85vw]"
      title="Выбрать товары для промокода"
      description="Отметьте товары или конкретные варианты, на которые будет действовать промокод"
    >
      <template #button>
        <Button variant="outline" type="button">
          <Plus class="pr-1" />
          Добавить товары
        </Button>
      </template>

      <template #content>
        <PromoProductSelectList
          :selectedList="selectedList"
          @addProducts="handleAdd"
        />
      </template>
    </DialogModal>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";
import DialogModal from "@/components/dynamics/shadcn/DialogModal.vue";
import Button from "@/components/ui/button/Button.vue";
import { Plus } from "lucide-vue-next";
import PromoProductSelectList from "@/components/discount/Promo/promo_product/PromoProductSelectList.vue";
import { Product } from "@/models/Product";

const emits = defineEmits(["addProducts"]);
const dialogRef = ref<InstanceType<typeof DialogModal> | null>(null);

const props = defineProps({
  selectedList: {
    type: Array as PropType<Product[]>,
    default: () => [],
  },
});

const handleAdd = (items: Product[]) => {
  emits("addProducts", items);
  dialogRef.value?.closeModal();
};
</script>

<style scoped></style>
