<!-- components/dynamics/BulkActionsMenu.vue -->
<script setup lang="ts">
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-vue-next"

const props = defineProps<{
  selectedIds: number[]
  actions: {
    label: string
    icon?: any
    onClick: (ids: number[]) => void
  }[]
}>()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="icon" :disabled="!selectedIds.length">
        <MoreHorizontal class="w-5 h-5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem
          v-for="action in actions"
          :key="action.label"
          @click="action.onClick(selectedIds)"
      >
        <component v-if="action.icon" :is="action.icon" class="w-4 h-4 mr-2" />
        {{ action.label }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
