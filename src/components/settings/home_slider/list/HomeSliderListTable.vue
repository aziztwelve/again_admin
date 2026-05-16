<template>
  <div>
    <DynamicsDataTable
        :data="items"
        :columns="columns"
        :show-print-button="false"
        :edit="edit"
        @deleted="handleDeleted"
        @save_changes="handleSave"
    />

    <ModalWithProgressBar
        :sending="sending"
        :target-progress="uploadProgress"
    />
  </div>
</template>

<script setup lang="ts">
import {h, PropType, ref} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import HomeSlider from "@/models/HomeSlider";
import SlideEdit from "@/components/settings/home_slider/SlideEdit.vue";
import {useHomeSlideFunctions} from "@/composables/useHomeSlideFunctions";
import {Check, X} from "lucide-vue-next";
import ModalWithProgressBar from "@/components/dynamics/ModalWithProgressBar.vue";

const props = defineProps({
  items: {
    type: Array as PropType<HomeSlider[]>,
    default: () => [],
  },
  loading: Boolean,
});

const emits = defineEmits(["deleted", "updated"]);

const {deleteSlide, updateSlide, sending, uploadProgress} = useHomeSlideFunctions();

const edit = ref({
  title: "Редактирование слайда",
  description: "Измените поля слайда, включая текст и изображения для desktop и mobile",
  component: SlideEdit,
  dynamicStyle: "2xl:min-w-[70vw] xl:min-w-[80vw] max-md:min-w-full md:min-w-[95vw]",
  loader: false,
});

const columns = [
  {
    accessorKey: "id",
    header: "№",
    cell: ({row}: any) => Number(row.id) + 1,
  },
  {
    accessorKey: "order",
    header: "Порядок отображения",
  },
  {
    accessorKey: "title",
    header: "Заголовок",
  },
  {
    accessorKey: "subtitle",
    header: "Подзаголовок",
  },
  {
    accessorKey: "text",
    header: "Текст",
  },
  {
    accessorKey: "image_url",
    header: "Desktop картинка",
    cell: ({row}: any) => {
      const url = row.original.image_urls;
      return url
          ? h(
              "img",
              {
                src: url.sm,
                alt: row.original.title ?? "desktop slide image",
                style: "height: 40px; object-fit: contain; cursor: pointer;",
                onClick: () => {
                  window.open(url.original, "_blank");
                },
              }
          )
          : "-";
    },
  },
  {
    accessorKey: "mobile_image_url",
    header: "Mobile картинка",
    cell: ({row}: any) => {
      const url = row.original.mobile_image_urls;
      return url
          ? h(
              "img",
              {
                src: url.sm,
                alt: row.original.title ?? "mobile slide image",
                style: "height: 40px; object-fit: contain; cursor: pointer;",
                onClick: () => {
                  window.open(url.original, "_blank");
                },
              }
          )
          : h("span", { class: "text-gray-400 text-sm" }, "Нет");
    },
  },
  {
    accessorKey: "is_active",
    header: "Активировано",
    cell: (row: any) => {
      return row.getValue()
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },
];

const handleDeleted = async (slide: HomeSlider) => {
  if (!slide.id) return;
  const success = await deleteSlide(slide.id);
  if (success) emits("deleted");
};

const handleSave = async (slide: HomeSlider) => {
  if (!slide.id) return;
  const updatedSlide = await updateSlide(slide.id, slide);
  if (updatedSlide) emits("updated");
};
</script>