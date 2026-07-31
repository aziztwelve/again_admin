<template>
  <DialogModal
      :key="renderModal"
      dynamic-style="w-[calc(100vw-2rem)] max-w-2xl"
      @dialog-open="dialogOpen"
  >
    <template #button>
      <IconButtons :buttons="[
          {type: 'edit'}
      ]"/>
    </template>

    <template #content>
      <CategoryForm
          :formData="categoryFormData"
          submit-button-name="Сохранить"
          @submit-form="handleSaveToServe"
      />
    </template>
  </DialogModal>
</template>

<script setup lang="ts">
import DialogModal from "@/components/dynamics/shadcn/DialogModal.vue";
import CategoryForm from "@/components/category/CategoryForm.vue";
import {ref} from "vue";
import {useCategoryFunctions} from "@/composables/useCategoryFunctions";
import IconButtons from "@/components/dynamics/IconButtons.vue";
import {Category, CategoryFormData, categoryFormUpdate} from "@/types/category";


interface Props {
  item: Category;
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'updated', category: Category): void
}>();


const renderModal = ref(1)

const categoryFormData = ref<CategoryFormData>(
    categoryFormUpdate(props.item)
);

const {sending, updateCategory, getProductsByCategory} = useCategoryFunctions()


const dialogOpen = async (param: boolean) => {
  if (param) {

    categoryFormData.value.product_ids = await getProductsByCategory({category_id: categoryFormData.value.id!})
        .then(res => {
          return res.products?.map((product: any) => product.id);
        })
  }
}


const handleSaveToServe = () => {
  try {
    updateCategory(
        categoryFormData.value.id!,
        categoryFormData.value
    ).then(res => {
      emit("updated", res.data);
      categoryFormData.value = categoryFormUpdate(res.data)

      renderModal.value++
    })

  } catch (e) {
    console.log(e)
  }

}

</script>

<style scoped>

</style>
