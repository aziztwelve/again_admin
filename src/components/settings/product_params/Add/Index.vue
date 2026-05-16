<template>
  <div class="flex">
    <Button
        variant="outline"
        size="icon"
        class="w-auto px-3"
        @click="dialogOpen = true"
    >
      <CirclePlus class="w-4 h-4 mr-2" /> Добавить
    </Button>

    <DynamicsModal
        :dialog-open="dialogOpen"
        @close="dialogOpen = false"
        title="Добавить новый параметр товара"
        description="Заполните информацию о новом параметре"
    >
      <template v-slot:content>
<!--        <ProductParamAddForm-->
<!--            @submit="handleSubmit"-->
<!--            @cancel="dialogOpen = false"-->
<!--        />-->
      </template>
    </DynamicsModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { Button } from "@/components/ui/button";
import DynamicsModal from "@/components/dynamics/Modal.vue";
import ProductParamAddForm from "@/components/settings/product_params/Add/Form.vue";
import { CirclePlus } from "lucide-vue-next";
// import { useProductParamFunctions } from "@/composables/useProductParamFunctions";

const emit = defineEmits(['submit'])
const dialogOpen = ref(false);
// const { addProductParam } = useProductParamFunctions();

async function handleSubmit(paramData: any) {
  try {
    // await addProductParam(paramData);
    dialogOpen.value = false;
    emit('submit');
  } catch (error) {
    console.error("Error adding product parameter:", error);
  }
}
</script>