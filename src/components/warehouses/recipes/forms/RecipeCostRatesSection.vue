<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <Label class="text-lg font-semibold">Ставки затрат</Label>
        <p class="text-sm text-muted-foreground">
          Укажите дополнительные затраты на производство
        </p>
      </div>
      <Button
          type="button"
          variant="outline"
          size="sm"
          @click="addCostRate"
      >
        <PlusIcon class="h-4 w-4 mr-2" />
        Добавить ставку
      </Button>
    </div>

    <div v-if="model.cost_rates.length === 0" class="rounded-lg border border-dashed p-8 text-center">
      <BanknoteIcon class="mx-auto h-10 w-10 text-muted-foreground" />
      <h3 class="mt-2 text-sm font-medium">Нет добавленных ставок</h3>
      <p class="mt-1 text-sm text-muted-foreground">
        Добавьте ставки для расчета себестоимости
      </p>
      <Button
          type="button"
          variant="outline"
          size="sm"
          class="mt-4"
          @click="addCostRate"
      >
        <PlusIcon class="h-4 w-4 mr-2" />
        Добавить ставку
      </Button>
    </div>

    <div v-else class="space-y-4">
      <div
          v-for="(rate, index) in model.cost_rates"
          :key="index"
          class="grid grid-cols-1 md:grid-cols-12 gap-4 border p-4 rounded-lg bg-background hover:bg-accent/50 transition-colors"
      >
        <!-- Категория затрат -->
        <div class="space-y-2 md:col-span-5">
          <Label>Категория затрат</Label>
          <Select
              v-model="rate.cost_category_id"
              :class="{ 'border-destructive': costRateV$.cost_category_id.$error }"
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Категории затрат</SelectLabel>
                <SelectItem
                    v-for="category in costCategories"
                    :key="category.id"
                    :value="category.id"
                    class="hover:bg-accent/50"
                >
                  {{ category.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <p v-if="costRateV$.cost_category_id.$error" class="text-sm text-destructive">
            Выберите категорию
          </p>
        </div>

        <!-- Ставка за единицу -->
        <div class="space-y-2 md:col-span-3">
          <Label>Ставка за единицу</Label>
          <div class="relative">
            <Input
                v-model.number="rate.rate_per_unit"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                class="pr-10"
            />
            <span class="absolute right-3 top-2.5 text-muted-foreground text-sm">₽</span>
          </div>
        </div>

        <!-- Фиксированная ставка -->
        <div class="space-y-2 md:col-span-3">
          <Label>Фиксированная ставка</Label>
          <div class="relative">
            <Input
                v-model.number="rate.fixed_rate"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                class="pr-10"
            />
            <span class="absolute right-3 top-2.5 text-muted-foreground text-sm">₽</span>
          </div>
        </div>

        <!-- Удаление -->
        <div class="flex items-end justify-end md:col-span-1">
          <Button
              type="button"
              variant="ghost"
              size="sm"
              @click="removeCostRate(index)"
              class="text-destructive hover:text-destructive"
          >
            <Trash2Icon class="h-4 w-4" />
          </Button>
        </div>

        <!-- Описание -->
        <div class="space-y-2 md:col-span-11 md:col-start-2">
          <Label>Комментарий</Label>
          <Input
              v-model="rate.description"
              placeholder="Описание ставки (необязательно)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, PropType} from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { PlusIcon, BanknoteIcon, Trash2Icon } from 'lucide-vue-next'
import {CostCategory} from "@/models/CostCategory";
import {SelectItem} from "@/components/ui/select";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";

const props = defineProps({
  model: {
    type: Object,
    required: true
  },
  costCategories: {
    type: Array as PropType<CostCategory[]>,
    required: true
  }
})

const emit = defineEmits(['update:model'])

const costRateV$ = useVuelidate(
    {
      cost_category_id: { required }
    },
    props.model.cost_rates
)

const addCostRate = () => {
  const newRates = [...props.model.cost_rates, {
    cost_category_id: props.costCategories[0]?.id || null,
    rate_per_unit: 0,
    fixed_rate: 0,
    description: ''
  }]

  emit('update:model', {
    ...props.model,
    cost_rates: newRates
  })
}

const removeCostRate = (index: number) => {
  const newRates = [...props.model.cost_rates]
  newRates.splice(index, 1)
  emit('update:model', {
    ...props.model,
    cost_rates: newRates
  })
}
</script>