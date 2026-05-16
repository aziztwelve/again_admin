<template>
    <AlertDialog>
      <!--    <AlertDialogTrigger>-->
      <!--    {{ disabledButton }}-->
      <Button
          v-if="!icon && !showIcon"
          :disabled="disabledButton"
          :class="buttonStyle"
          :size="buttonSize"
          :variant="buttonVariant"
      >
        <AlertDialogTrigger>{{ buttonName }}</AlertDialogTrigger>
      </Button>
      <!--    <button v-else :disabled="true" class="">-->
      <AlertDialogTrigger :disabled="disabledButton">
        <component
            v-if="showIcon"
            :class="[iconStyle || 'text-gray-400 hover:text-gray-500 transition']"
            :size="iconSize || 17"
            :is="icon"
        />
      </AlertDialogTrigger>
      <!--    </button>-->

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle class="text-gray-800 text-md">{{ title }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ description }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отменить</AlertDialogCancel>
          <AlertDialogAction @click="emit('continue', true)">
            Да
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
</template>

<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Button} from '@/components/ui/button'
import type {Component, PropType} from 'vue'


const emit = defineEmits(["continue"]);

const props = defineProps({
  disabledButton: {
    type: Boolean,
    default: false,
  },
  buttonVariant: {
    type: String as PropType<"default" | "destructive" | "outline" | "secondary" | "ghost" | "link">,
    default: "outline",
  },
  buttonName: String,
  buttonSize: {
    type: String as PropType<"default" | "xs" | "sm" | "lg" | "icon">,
    default: "default",
  },
  title: String,
  description: String,
  buttonStyle: String,
  icon: Object as PropType<Component>,
  showIcon: Boolean,
  iconSize: Number,
  iconStyle: String,
})


</script>
