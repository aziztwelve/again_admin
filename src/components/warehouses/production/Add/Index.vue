<template>
  <div class="flex justify-end">
    <Button
        variant="outline"
        size="icon"
        class="w-auto px-3"
        @click="dialogOpen = true"
    >
      <CirclePlus class="w-3 h-3"/>
    </Button>

    <DynamicsModal
        :dialog-open="dialogOpen"
        @close="dialogOpen = false"
        title="Добавить новую зону"
    >
      <template v-slot:content>
        <WarehousesProductionAddForm
            @submit="emit('created');
            dialogOpen = false"
        />
      </template>
    </DynamicsModal>
  </div>
</template>

<script setup>
import {Button} from "@/components/ui/button";
import DynamicsModal from "@/components/dynamics/Modal.vue";
import {CirclePlus} from "lucide-vue-next";
import {ref} from "vue";
import WarehousesProductionAddForm from "@/components/warehouses/production/Add/Form.vue";


const props = defineProps({
  deliverers: {
    type: Array,
    default: []
  },
  applicants: {
    type: Array,
    default: []
  }
})

const emit = defineEmits(['created'])

const dialogOpen = ref(false);
</script>

<style scoped></style>
