<template>
  <Drawer>
    <!-- Trigger кнопка -->

    <DrawerTrigger>
      <slot name="buttonTrigger"/>
    </DrawerTrigger>


    <DrawerContent>
      <DrawerHeader>
        <!-- Если есть слот title, используем его, иначе props -->
        <DrawerTitle>
          <span>{{ props.title }}</span>
        </DrawerTitle>

        <DrawerDescription>
          <span>{{ props.description }}</span>
        </DrawerDescription>
      </DrawerHeader>

      <div class="w-full h-[80vh] overflow-y-auto p-2">
        <slot></slot>
      </div>

      <!-- Footer -->
      <DrawerFooter v-if="props.showFooter || !!slots.footer">
        <slot name="footer">
          <Button>Submit</Button>
          <DrawerClose>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </slot>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
<script setup lang="ts">
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {defineProps, defineSlots} from 'vue'

const props = defineProps<{
  title?: string
  description?: string
  showFooter?: boolean
}>()

// Слоты
const slots = defineSlots<{
  default: never
  footer: never
  buttonTrigger: never
}>()
</script>
