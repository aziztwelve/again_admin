<template>
  <div>
    <DialogModal
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
          :selectedList="selectedList"
          @addToSelectList="emits('addToSelectList', $event)"
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
import { PropType } from "vue";

const emits = defineEmits(["addToSelectList"]);

const props = defineProps({
  selectedList: {
    type: Array as PropType<{ product_id: number; quantity: number }[]>,
    default: () => [],
  },
});
</script>

<style scoped></style>
