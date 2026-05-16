<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <div>
        <Label class="text-sm font-medium">Компоненты техкарты</Label>
        <p class="text-xs text-muted-foreground">Материалы и продукты для производства</p>
      </div>
      <Button
          type="button"
          variant="outline"
          size="sm"
          @click="addComponent"
          :disabled="isAddingDisabled"
          class="h-8 text-xs"
      >
        <PlusIcon class="h-3 w-3 mr-1"/>
      </Button>
    </div>

    <div v-if="model && model.material_items?.length === 0" class="rounded-lg border border-dashed p-4 text-center">
      <PackageOpenIcon class="mx-auto h-5 w-5 text-muted-foreground"/>
      <h3 class="mt-1 text-xs font-medium">Нет компонентов</h3>
      <p class="mt-1 text-xs text-muted-foreground">Добавьте материалы или продукты</p>
    </div>

    <div v-else class="space-y-2">
      <div
          v-for="(item, index) in model?.material_items"
          :key="item?.id ?? index"
          class="grid grid-cols-1 gap-2 border p-2 rounded-lg bg-background hover:bg-accent/50 transition-colors"
      >
        <div class="grid md:grid-cols-10 grid-cols-1 gap-2 items-end">
          <!-- Component Type -->
          <div class="md:col-span-3">
<!--            {{item.component_type}}-->
            <Label class="text-xs">Тип</Label>
            <Select v-model="item.component_type">
              <SelectTrigger class="h-8 text-xs">
                <SelectValue placeholder="Выберите тип"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Product" class="text-xs">Материал</SelectItem>
                <!--                <SelectItem value="Product" class="text-xs">Продукт</SelectItem>-->
              </SelectContent>
            </Select>
          </div>

          <!-- Component Selection -->
          <div class="md:col-span-4">
            <Label class="text-xs">{{ item.component_type === 'Product' ? 'Материал' : 'Продукт' }}</Label>
            <Select required v-model="item.component_id" @update:modelValue="loadVariants(item)">
              <SelectTrigger class="h-8 text-xs">
                <SelectValue>
                  {{ getComponentName(item) }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <template v-if="item.component_type === 'Product'">
                  <SelectItem
                      v-for="material in materials"
                      :key="material.id"
                      :value="material.id"
                      class="text-xs"
                  >
                    {{ material.name }}
                  </SelectItem>
                </template>
                <template v-else>
                  <SelectItem
                      v-for="product in products"
                      :key="product.id"
                      :value="product.id"
                      class="text-xs"
                  >
                    {{ product.name }}
                  </SelectItem>
                </template>
              </SelectContent>
            </Select>
          </div>

          <!-- Quantity -->
          <div class="md:col-span-1">
            <Label class="text-xs">Кол-во</Label>
            <Input
                v-model.number="item.quantity"
                type="number"
                min="0"
                step="1"
                class="h-8 text-xs min-w-8"
            />
          </div>


          <Button
              type="button"
              variant="ghost"
              size="icon"
              class="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              @click="removeComponent(index)"
          >
            <Trash2Icon class="h-4 w-4 mx-auto"/>
          </Button>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted} from 'vue'
import {PlusIcon, PackageOpenIcon, Trash2Icon} from 'lucide-vue-next'
import {Label} from "@/components/ui/label"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps({
  model: {type: Object, required: true},
  units: {type: Array, required: true},
  materials: {type: Array, required: true},
  products: {type: Array, required: true},
  isUnitsLoading: {type: Boolean, default: false},
  errors: {type: Object, default: () => ({})}
})

const emit = defineEmits(['update:model', 'load-variants'])

const isAddingDisabled = computed(() => {
  return props.isUnitsLoading || props.units?.length === 0
})

const addComponent = () => {
  emit('update:model', {
    ...props.model,
    material_items: [
      ...props.model?.material_items,
      {
        id: Date.now().toString(),
        component_type: 'Product',
        component_id: null,
        variant_id: null,
        quantity: 0,
        unit_id: 1,
      }
    ]
  })
}

const removeComponent = (index: number) => {
  const newItems = props.model?.material_items.filter((_, i) => i !== index)
  emit('update:model', {...props.model, material_items: newItems})
}

const loadVariants = (item) => {
  if (item.component_type === 'Product' && item.component_id) {
    emit('load-variants', item.component_id)
  }
}

const getComponentName = (item) => {
  if (!item.component_id) return 'Выберите'
  if (item.component_type === 'Product') {
    return props.materials?.find(m => m.id === item.component_id)?.name || 'Материал'
  } else {
    return props.products?.find(p => p.id === item.component_id)?.name || 'Продукт'
  }
}

</script>

<style scoped>
.compact-item :deep(.form-row) {
  @apply gap-2;
}

.compact-item :deep(.select-trigger),
.compact-item :deep(.input) {
  @apply h-8 text-xs;
}

.compact-item :deep(.label) {
  @apply text-xs;
}
</style>