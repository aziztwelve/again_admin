<template>
  <div class="flex space-x-2 justify-end">
    <AlertDialog
        title="Отменить производство"
        description="Вы уверены что хотите отменить это производственное задание?"
        button-name="Отменить"
        button-style="bg-orange-500 hover:bg-orange-600"
        :icon="XCircle"
        @continue="$emit('cancel-production', item)"
        button-component="icon"
        icon-size="17"
    />

<!--    <AlertDialog-->
<!--        title=""-->
<!--        description="Вы уверены что хотите удалить?"-->
<!--        button-name="Удалить"-->
<!--        button-style="bg-red-500 hover:bg-red-600"-->
<!--        :icon="Trash2"-->
<!--        @continue="$emit('deleted', item)"-->
<!--    />-->

    <ArrowRight
        class="text-gray-400 hover:text-gray-500 transition cursor-pointer"
        :size="17"
        @click="router.push(`/warehouses/production/edit/${item?.base_batch_number}`)"
    />
  </div>
</template>

<script setup lang="ts">
import {Trash2, ArrowRight, XCircle} from "lucide-vue-next";
import AlertDialog from "@/components/dynamics/AlertDialog.vue"
import {useRouter} from "vue-router";

const router = useRouter()

defineProps({
  item: {
    type: Object,
    required: true
  },
  edit: {
    type: Object,
    required: true
  }
});

defineEmits([
  'save_changes', 'deleted', 'arrow_right', 'cancel-production'
]);


</script>
