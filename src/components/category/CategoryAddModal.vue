<template>
  <DialogModal
      ref="modalRef"
      dynamic-style="w-[calc(100vw-2rem)] max-w-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain"
  >
    <template #button>
      <Button variant="outline" class="max-md:w-full">Добавить</Button>
    </template>

    <template #content>
      <CategoryForm
          :formData="category"
          @submit-form="handleSaveToServe"
      />
    </template>
  </DialogModal>
</template>

<script setup lang="ts">
import {Button} from "@/components/ui/button";
import DialogModal from "@/components/dynamics/shadcn/DialogModal.vue";
import CategoryForm from "@/components/category/CategoryForm.vue";
import {ref} from "vue";
import {useCategoryFunctions} from "@/composables/useCategoryFunctions";
import {Category, CategoryFormData, initialCategoryFormData} from "@/types/category";

const emit = defineEmits<{
  (e: 'created', category: Category): void;
}>();


const modalRef = ref<{
  closeModal: () => void;
} | null>(null)

const category = ref<CategoryFormData>({ ...initialCategoryFormData });

const {createCategory, sending} = useCategoryFunctions()

const handleSaveToServe = () => {

  try {
    createCategory(category.value)
        .then(res => {
          emit("created", res.data)
          category.value = { ...initialCategoryFormData }

          modalRef.value?.closeModal()
        })

  } catch (e) {
    console.log(e)
  }


}


</script>

<style scoped>

</style>
