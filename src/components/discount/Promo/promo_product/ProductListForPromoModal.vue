<template>
  <div>
    <DialogModal
        dynamic-style="min-w-[85vw]"
    >
      <template #button>
        <Button variant="outline">
          <Plus class="pr-1"/>
          Товар
        </Button>
      </template>

      <template #content>

        <ProductListForPromo
            :selectedList="selectedList"
            @addToSelectList="emits('addToSelectList', $event)"
            @addToSelectListVariant="emits('addToSelectListVariant', $event)"
        />

      </template>


    </DialogModal>
  </div>
</template>

<script setup lang="ts">
import DialogModal from "@/components/dynamics/shadcn/DialogModal.vue";
import Button from "@/components/ui/button/Button.vue";
import {Plus} from "lucide-vue-next"
import ProductListForPromo from "@/components/discount/Promo/promo_product/ProductListForPromo.vue";
import {PropType} from "vue";
import {Product} from "@/models/Product";


const emits = defineEmits(["addToSelectList", "addToSelectListVariant"]);

const props = defineProps({
  selectedList: {
    type: Array as PropType<Product[]>,
    default: () => []
  },
})

</script>

<style scoped>

</style>