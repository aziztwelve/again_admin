<template>
  <TagForm
      submit-button-name="Создать и добавить"
      :key="renderFormComponent"
      :form-data="formData"
      @submit-form="handleSubmit"
  />
</template>

<script setup lang="ts">
import TagForm from "@/components/Tag/From/TagForm.vue";
import {ref} from "vue";
import {initialTagFormData, Tag, TagFormData} from "@/types/tag";
import {useTagFunctions} from "@/composables/Tag/useTagFunctions";
import {toast} from "vue-sonner";

const emit = defineEmits<{
  (e: 'tagAdded', tag: Tag): void
}>()

const formData = ref<TagFormData>(initialTagFormData)
const renderFormComponent = ref(1)

const {
  createTag
} = useTagFunctions()


const handleSubmit = () => {
  if (!formData.value.name.trim()) {
    toast.info('Введите название')
    return
  }
  createTag({
    name: formData.value.name
  })
      .then(tag => {
        emit('tagAdded', tag)
        renderFormComponent.value++
        formData.value = initialTagFormData
      })
      .catch(err => {
        console.log(err)
      })
}

</script>


<style scoped>

</style>