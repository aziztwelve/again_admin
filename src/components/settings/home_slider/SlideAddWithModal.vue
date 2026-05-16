<template>
  <ModalDialog
      :key="renderModal"
      dynamic-style="2xl:min-w-[70vw] xl:min-w-[80vw] max-md:min-w-full md:min-w-[95vw]"
      title="Создать новый слайд"
      description="Заполните форму, чтобы добавить новый слайд на главную страницу. Укажите заголовок, подзаголовок, текст и загрузите изображение."
  >
    <template #trigger>
      <Button variant="outline" class="max-md:w-full">
        Добавить
      </Button>
    </template>

    <template #content>
      <SlideAdd
          @created="
          emit('created', $event);
          renderModal++"
      />
    </template>
  </ModalDialog>

</template>

<script setup lang="ts">
import ModalDialog from "@/components/dynamics/shadcn/ModalDialog.vue";
import {Button} from "@/components/ui/button";
import SlideAdd from "@/components/settings/home_slider/SlideAdd.vue";
import {ref} from "vue";

const emit = defineEmits(["created"]);

const renderModal = ref(1);

</script>


<style scoped>

</style>