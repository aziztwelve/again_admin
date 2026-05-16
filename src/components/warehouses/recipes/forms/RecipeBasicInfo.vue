<template>
  <TooltipProvider>
    <!-- Статус активности -->
    <div class="flex items-center space-x-2 md:col-span-2 pt-2">
      <Switch
          id="is_active"
          v-model="model.is_active"
          :class="model.is_active ? 'bg-primary' : 'bg-muted'"
      />
      <Label for="is_active" class="flex items-center gap-1.5">
        <span>Активная техкарта</span>
        <Tooltip>
          <TooltipTrigger>
            <InfoIcon class="h-4 w-4 text-muted-foreground"/>
          </TooltipTrigger>
          <TooltipContent class="max-w-[300px]">
            <p>Неактивные техкарты нельзя будет использовать в производстве</p>
          </TooltipContent>
        </Tooltip>
      </Label>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">

        <!-- Название техкарты -->
        <div class="space-y-2">
          <Label for="name" class="flex items-center">
            Название техкарты
            <span class="text-destructive ml-1">*</span>
          </Label>
          <Input
              id="name"
              v-model="model.name"
              placeholder="Например: 'Классический стул'"
              required
              :class="{ 'border-destructive': v$.name.$error }"
          />
          <p v-if="v$.name.$error" class="text-sm text-destructive">
            Поле обязательно для заполнения
          </p>
        </div>


        <!-- Время производства -->
        <div class="space-y-2">
          <Label for="production_time" class="flex items-center">
            Время производства (мин)
            <span class="text-destructive ml-1">*</span>
          </Label>
          <div class="relative">
            <Input
                id="production_time"
                v-model.number="model.production_time"
                type="number"
                min="0"
                step="1"
                placeholder="Например: 120"
                required
                class="pr-10"
                :class="{ 'border-destructive': v$.production_time.$error }"
            />
            <span class="absolute right-3 top-2.5 text-muted-foreground text-sm">мин</span>
          </div>
          <p v-if="v$.production_time.$error" class="text-sm text-destructive">
            Введите корректное значение (мин. 0)
          </p>
        </div>


      </div>
      <!-- Описание -->
      <div class="h-full">
        <Label for="description">Описание</Label>
        <Textarea
            id="description"
            v-model="model.description"
            placeholder="Краткое описание техкарты"
            class="min-h-[100px]"
        />
      </div>
    </div>
  </TooltipProvider>
</template>

<script setup lang="ts">
import {computed, PropType} from 'vue'
import {useVuelidate} from '@vuelidate/core'
import {required, minValue} from '@vuelidate/validators'
import {InfoIcon} from 'lucide-vue-next'
import {Unit} from '@/models/Unit'

import {Label} from '@/components/ui/label'
import {Input} from '@/components/ui/input'
import {Textarea} from '@/components/ui/textarea'
import {Switch} from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  units: {
    type: Array as PropType<Unit[]>,
    required: true
  },
  isUnitsLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const rules = computed(() => ({
  name: {required},
  output_unit_id: {required},
  production_time: {required, minValue: minValue(0)}
}))

const v$ = useVuelidate(rules, props.model)
</script>
