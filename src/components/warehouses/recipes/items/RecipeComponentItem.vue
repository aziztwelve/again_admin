<template>
  <div class="grid grid-cols-1 md:grid-cols-11 gap-4 border p-4 rounded-lg bg-background hover:bg-accent/50 transition-colors">


    <!-- Component Type -->
    <div class="space-y-2 md:col-span-3">
      <Label>Тип компонента</Label>
      <Select v-model="model.component_type" @update:modelValue="handleTypeChange">
        <SelectTrigger>
          <SelectValue placeholder="Выберите тип" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Material">
            <div class="flex items-center gap-2">
              <BoxIcon class="h-4 w-4" />
              <span>Материал</span>
            </div>
          </SelectItem>
          <SelectItem value="Product">
            <div class="flex items-center gap-2">
              <Package2Icon class="h-4 w-4" />
              <span>Продукт</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Component Selection -->
    <div class="space-y-2 md:col-span-4">
      <Label>Компонент</Label>
      <Select
          v-model="model.component_id"
          :disabled="!model.component_type"
          :class="{ 'border-destructive': v$.component_id.$error }"
      >
        <SelectTrigger>
          <SelectValue>
            <span v-if="!model.component_type">Сначала выберите тип</span>
            <span v-else-if="!model.component_id">Не выбран</span>
            <span v-else>{{ selectedComponentName }}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>
              {{ model.component_type === 'Material' ? 'Материалы' : 'Продукты' }}
            </SelectLabel>
            <SelectItem
                v-for="item in availableComponents"
                :key="item.id"
                :value="item.id"
            >
              <div class="flex items-center justify-between w-full">
                <span>{{ item.name }}</span>
                <span v-if="item.stock !== undefined" class="text-xs text-muted-foreground ml-2">
                  На складе: {{ item.stock }}
                </span>
              </div>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <p v-if="v$.component_id.$error" class="text-sm text-destructive">
        Выберите компонент
      </p>
    </div>

    <!-- Quantity and Unit -->
    <div class="space-y-2 md:col-span-3">
      <Label>Кол-во</Label>
      <div class="flex items-center gap-2">
        <Input
            v-model.number="model.quantity"
            type="number"
            min="0"
            step="0.001"
            :class="{ 'border-destructive': v$.quantity.$error }"
        />
        <Select
            v-model="model.unit_id"
            class="w-[100px]"
            :disabled="isUnitsLoading"
            :class="{ 'border-destructive': v$.unit_id.$error }"
        >
          <SelectTrigger>
            <SelectValue>{{ unitAbbreviation }}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem
                v-for="unit in units"
                :key="unit.id"
                :value="unit.id"
            >
              {{ unit.abbreviation }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p v-if="v$.quantity.$error" class="text-sm text-destructive">
        Введите корректное значение
      </p>
    </div>

    <!-- Remove Button -->
    <div class="flex items-end justify-end md:col-span-1">
      <Button
          type="button"
          variant="ghost"
          size="sm"
          @click="$emit('remove')"
          class="text-destructive hover:text-destructive"
      >
        <Trash2Icon class="h-4 w-4" />
      </Button>
    </div>

    <!-- Collapsible Advanced Fields -->
    <div class="md:col-span-11 md:col-start-2 space-y-3">
      <Collapsible v-model="isExpanded">
        <CollapsibleTrigger as-child>
          <Button
              type="button"
              variant="ghost"
              size="sm"
              class="w-full flex items-center justify-between px-0"
          >
            <span class="text-sm text-muted-foreground">Дополнительные параметры</span>
            <ChevronDownIcon
                class="h-4 w-4 text-muted-foreground transition-transform duration-200"
                :class="{ 'transform rotate-180': isExpanded }"
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <!-- Waste Percentage -->
            <div class="space-y-2">
              <Label for="waste">Процент отходов</Label>
              <div class="relative">
                <Input
                    id="waste"
                    v-model.number="model.waste_percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    class="pr-10"
                />
                <span class="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
              </div>
              <p class="text-sm text-muted-foreground">Учитывается при расчете себестоимости</p>
            </div>

            <!-- Notes -->
            <div class="space-y-2">
              <Label for="notes">Примечание</Label>
              <Input
                  id="notes"
                  v-model="model.notes"
                  placeholder="Дополнительная информация"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, minValue } from '@vuelidate/validators'
import {
  GripVerticalIcon,
  BoxIcon,
  Package2Icon,
  Trash2Icon,
  ChevronDownIcon,
} from 'lucide-vue-next'
import { Unit } from '@/models/Unit'
import { Material } from '@/models/Material'
import {Product} from '@/models/Product'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectLabel
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from 'reka-ui'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  model: any,
  index: number,
  units: Unit[],
  materials: Material[],
  products: Product[],
  isUnitsLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'remove'): void
}>()

const isExpanded = ref(false)

const availableComponents = computed(() => {
  return props.model.component_type === 'Material' ? props.materials : props.products
})

const selectedComponentName = computed(() => {
  const component = availableComponents.value.find(c => c.id === props.model.component_id)
  return component?.name || 'Неизвестный компонент'
})

const unitAbbreviation = computed(() => {
  const unit = props.units.find(u => u.id === props.model.unit_id)
  return unit?.abbreviation || '—'
})

const rules = {
  component_id: { required },
  quantity: { required, minValue: minValue(0) },
  unit_id: { required },
}

const v$ = useVuelidate(rules, props.model)

function handleTypeChange(newType: string) {
  emit('update:modelValue', {
    ...props.model,
    component_type: newType,
    component_id: null,
  })
}
</script>
