<template>
  <div>
    <DialogModal
      ref="dialogRef"
      dynamic-style="min-w-[85vw]"
      title="Выбрать товары-подарки"
      description="Выберите товары, которые клиент получит в подарок"
    >
      <template #button>
        <Button variant="outline" type="button">
          <Plus class="pr-1" />
          Добавить подарок
        </Button>
      </template>

      <template #content>
        <GiftProductList
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
import GiftProductList from "@/components/discount/Promotion/gift_product/GiftProductList.vue";
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
