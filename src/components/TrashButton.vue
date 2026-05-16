<template>
  <button @click="handleDelete" class="p-1 text-red-500 hover:text-red-700">
    dsfsd
    <Trash2 />
  </button>
</template>

<script setup>
import { Trash2 } from 'lucide-vue-next';

const props = defineProps(["data"]);
const emit = defineEmits(["delete"]);

const handleDelete = () => {
  if (confirm("Вы уверены, что хотите удалить этот товар?")) {
    emit("delete", props.data);
  }
};
</script>

