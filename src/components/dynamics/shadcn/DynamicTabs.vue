<script setup lang="ts">
import {computed} from 'vue'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

interface Tab {
  tab: string
  title: string
  content: string | any // Можете указать более конкретный тип для content
  disabled: boolean
}

const props = defineProps<{
  tabs: Tab[]
  modelValue?: string // для v-model
  class?: string
}>()

const emit = defineEmits(['update:modelValue'])

const activeTab = computed({
  get: () => props.modelValue || props.tabs[0]?.tab,
  set: (tab) => emit('update:modelValue', tab)
})
</script>

<template>
  <Tabs v-model="activeTab" :class="['w-[400px]', props.class]">
    <TabsList class="grid w-full overflow-x-auto" :style="`grid-template-columns: repeat(${tabs.length}, 1fr)`">
      <TabsTrigger
          v-for="tab in tabs"
          :key="tab.tab"
          :disabled="tab.disabled"
          :value="tab.tab"
      >
        {{ tab.title }}
      </TabsTrigger>
    </TabsList>

    <TabsContent
        v-for="tab in tabs"
        :key="`content-${tab.tab}`"
        :value="tab.tab"
        class="w-full"
    >
      <!-- Слот для контента таба -->
      <slot :name="`${tab.tab}`" :tab="tab">
        {{ tab.content }}
      </slot>
    </TabsContent>
  </Tabs>
</template>