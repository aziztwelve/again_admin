<template>
  <div class="flex items-center space-x-2">
    <template v-for="button in buttons" :key="button.type">
      <!-- Regular buttons -->
      <component
          v-if="button.type !== 'delete'"
          :is="iconsMap[button.type]"
          :size="button.size || size"
          :class="[
          'cursor-pointer',
          button.class || 'text-gray-400 hover:text-gray-500',
          disabled && 'opacity-50 cursor-not-allowed'
        ]"
          @click="!disabled && handleClick(button.type, context)"
      />

      <!-- Delete button with AlertDialog -->
      <AlertDialog
          v-else
          :key="'delete-dialog'"
          :title="deleteDialogTitle"
          :description="deleteDialogDescription"
          :button-name="deleteButtonText"
          :button-style="deleteButtonStyle"
          :icon="Trash2"
          :disabled-button="disabled"
          :show-icon="true"
          @continue="!disabled && handleDeleteConfirmed(context)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import {Pencil, Trash2, Eye, Plus, Minus, Copy, Boxes} from 'lucide-vue-next';
import type {Component} from 'vue';
import AlertDialog from './AlertDialog.vue'; // Adjust the import path

type IconType = 'edit' | 'delete' | 'view' | 'add' | 'remove' | 'copy' | 'boxes' | string;
type ButtonAction<T = any> = (context: T) => void;

interface IconButton {
  type: IconType;
  onClick?: ButtonAction;
  size?: number | string;
  class?: string;
}

interface Props<T = any> {
  buttons: IconButton[];
  context?: T;
  size?: number | string;
  disabled?: boolean;
  deleteDialogTitle?: string;
  deleteDialogDescription?: string;
  deleteButtonText?: string;
  deleteButtonStyle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 17,
  disabled: false,
  deleteDialogTitle: 'Подтверждение удаления',
  deleteDialogDescription: 'Вы уверены что хотите удалить?',
  deleteButtonText: 'Удалить',
  deleteButtonStyle: 'bg-red-500 hover:bg-red-600'
});

interface Emits {
  (event: 'action', payload: { type: IconType; context?: any }): void;

  (event: 'hard_deleted', payload: any): void;
}

const emit = defineEmits<Emits>();

const iconsMap: Record<IconType, Component> = {
  edit: Pencil,
  delete: Trash2,
  view: Eye,
  add: Plus,
  remove: Minus,
  copy: Copy,
  boxes: Boxes,
};

const handleClick = (type: IconType, context?: any) => {
  const button = props.buttons.find(b => b.type === type);
  if (button?.onClick) {
    button.onClick(context);
  }
  emit('action', {type, context});
};

const handleDeleteConfirmed = (context?: any) => {
  const button = props.buttons.find(b => b.type === 'delete');
  if (button?.onClick) {
    button.onClick(context);
  }
  emit('action', {type: 'delete', context});
  emit('hard_deleted', context);
};
</script>