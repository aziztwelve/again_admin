<template>
  <div>
    <DialogModal
      ref="dialogRef"
      dynamic-style="min-w-[85vw]"
      title="Добавить позицию"
      description="Выберите товары и/или конкретные варианты — они будут добавлены в заказ"
    >
      <template #button>
        <Button type="button" variant="outline" class="gap-2">
          <Plus class="h-4 w-4" />
          Позиция
        </Button>
      </template>

      <template #content>
        <OrderProductPickerList @select="handleSelect" />
      </template>
    </DialogModal>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Plus } from "lucide-vue-next";
import DialogModal from "@/components/dynamics/shadcn/DialogModal.vue";
import Button from "@/components/ui/button/Button.vue";
import OrderProductPickerList from "@/components/orders/modals/order_product_picker/OrderProductPickerList.vue";

const emit = defineEmits(["select"]);
const dialogRef = ref(null);

// Модалка отдаёт массив items вида [{ product, variant }] — каждый элемент
// эмитится отдельным событием `select`, чтобы остаться совместимой с
// текущими хендлерами addPosition (OrderCreate / OrderView / update/order.vue).
const handleSelect = (items) => {
  if (!Array.isArray(items) || items.length === 0) return;
  items.forEach((entry) => emit("select", entry));
  dialogRef.value?.closeModal?.();
};
</script>

<style scoped></style>
