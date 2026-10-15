<template>
  <div class="space-y-4">
    <label v-if="channel === 'email'" class="block text-sm font-medium">Тема письма
      <input :value="modelValue.subject" maxlength="255" class="mt-1 block w-full rounded-md border px-3 py-2 font-normal" placeholder="Стандартная тема сценария" @input="update('subject', ($event.target as HTMLInputElement).value)" />
    </label>
    <label v-if="channel === 'email'" class="block text-sm font-medium">Формат
      <select :value="modelValue.format" class="mt-1 block w-full rounded-md border bg-white px-3 py-2 font-normal" @change="update('format', ($event.target as HTMLSelectElement).value)"><option value="text">Обычный текст</option><option value="html">HTML</option></select>
    </label>
    <label class="block text-sm font-medium">Текст сообщения
      <textarea :value="modelValue.body" rows="9" maxlength="50000" class="mt-1 block w-full rounded-md border px-3 py-2 font-mono text-sm font-normal" placeholder="Оставьте пустым для стандартного сценария или напишите свой шаблон." @input="update('body', ($event.target as HTMLTextAreaElement).value)" />
    </label>
    <div class="flex flex-wrap gap-2"><button v-for="variable in variables" :key="variable" type="button" class="rounded border bg-gray-50 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100" @click="update('body', modelValue.body + variable)">{{ variable }}</button></div>
    <p class="text-xs text-gray-500">Переменные подставляют имя, ID корзины, товары, сумму, ссылку и название магазина. Пустой шаблон использует действующий сценарий.</p>
  </div>
</template>
<script setup lang="ts">
import type {CartMessageContent} from '@/types/abandoned-cart'
const props = defineProps<{modelValue: CartMessageContent; channel: string}>()
const emit = defineEmits<{(e: 'update:modelValue', value: CartMessageContent): void}>()
const variables = ['{{client.name}}', '{{cart.id}}', '{{cart.items}}', '{{cart.total}}', '{{cart.url}}', '{{shop.name}}']
const update = (key: string, value: string) => emit('update:modelValue', {...props.modelValue, [key]: value} as CartMessageContent)
</script>
