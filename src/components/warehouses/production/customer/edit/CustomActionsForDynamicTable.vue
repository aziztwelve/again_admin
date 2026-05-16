<template>
  <div class="flex space-x-2 justify-end">
    <Edit
        :item="item"
        :edit="edit"
        @save_changes="$emit('save_changes', $event)"
    />
    <AlertDialog
        title=""
        description="Вы уверены что хотите удалить?"
        button-name="Удалить"
        button-style="bg-red-500 hover:bg-red-600"
        :icon="Trash2"
        @continue="$emit('deleted', item)"
    />

  </div>
</template>

<script setup lang="ts">
import {Trash2, ArrowRight, Pencil, Eye} from "lucide-vue-next";

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
  'save_changes', 'deleted'
]);
</script>
