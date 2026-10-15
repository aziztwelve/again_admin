<template>
  <Dialog :open="open" @update:open="!$event && $emit('close')">
    <DialogContent class="left-auto right-0 top-0 flex h-dvh max-h-dvh w-full max-w-[860px] translate-x-0 translate-y-0 flex-col gap-0 rounded-none p-0 sm:rounded-none">
      <DialogHeader class="border-b px-6 py-5 pr-12"><DialogTitle>Список товаров</DialogTitle><DialogDescription>Текущий состав корзин с учётом периода, статуса и поиска в списке корзин.</DialogDescription></DialogHeader>
      <div class="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5 sm:p-6">
        <div class="rounded-lg border bg-white">
          <label class="block border-b p-4 text-sm">Поиск товара<input v-model="search" placeholder="Название или артикул" class="mt-2 block w-full rounded-md border px-3 py-2" /></label>
          <p v-if="loading" role="status" class="py-10 text-center text-sm text-gray-500">Загружаем товары…</p>
          <div v-else-if="!products" class="p-6 text-center"><p class="text-sm text-gray-500">Не удалось загрузить товары.</p><Button class="mt-3" variant="outline" @click="load">Повторить</Button></div>
          <template v-else>
            <p v-if="!products.data.length" class="py-10 text-center text-sm text-gray-500">Товары не найдены.</p>
            <ul v-else class="divide-y"><li v-for="item in products.data" :key="`${item.product_id}-${item.product_variant_id}-${item.color_id}`" class="flex items-start gap-3 p-4">
              <img v-if="item.image_url" :src="item.image_url" :alt="item.name" class="h-12 w-12 shrink-0 rounded border object-cover" />
              <Package v-else class="h-12 w-12 shrink-0 rounded bg-gray-50 p-3 text-gray-400" />
              <div class="min-w-0 flex-1"><p class="text-sm font-medium">{{ item.name }}</p><p class="mt-1 text-xs text-gray-500">{{ [item.variant_name, item.color].filter(Boolean).join(' · ') }}</p><p class="text-xs text-gray-500">Артикул: {{ item.sku || '—' }}</p></div>
              <div class="text-right text-sm"><p>{{ item.quantity }} шт.</p><p class="mt-1 whitespace-nowrap font-semibold">{{ money(item.total) }}</p></div>
            </li></ul>
            <div v-if="products.last_page > 1" class="flex items-center justify-between gap-3 border-t p-4 text-sm"><Button variant="outline" :disabled="page <= 1" @click="page--; load()">Назад</Button><span>{{ page }} / {{ products.last_page }}</span><Button variant="outline" :disabled="page >= products.last_page" @click="page++; load()">Далее</Button></div>
          </template>
        </div>
      </div>
      <footer class="flex justify-end border-t px-6 py-4"><Button variant="outline" @click="$emit('close')">Закрыть</Button></footer>
    </DialogContent>
  </Dialog>
</template>
<script setup lang="ts">
import {onBeforeUnmount, ref, watch} from 'vue'
import {Package} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from '@/components/ui/dialog'
import {useAbandonedCartFunctions} from '@/composables/useAbandonedCartFunctions'
import type {AbandonedCartListFilters, CartProductSummary, Paginated} from '@/types/abandoned-cart'
const props = defineProps<{open: boolean; filters: AbandonedCartListFilters}>()
defineEmits<{(e: 'close'): void}>()
const {getCartProducts} = useAbandonedCartFunctions()
const search = ref(''), page = ref(1), loading = ref(false), products = ref<Paginated<CartProductSummary>>()
let version = 0, timer: ReturnType<typeof setTimeout> | undefined
const load = async () => {
  const current = ++version
  if (!props.open) return
  loading.value = true
  const result = await getCartProducts({...props.filters, cart_search: props.filters.search, search: search.value, per_page: 20, page: page.value})
  if (current !== version) return
  products.value = result; loading.value = false
}
watch(() => props.open, open => {version++; if (timer) clearTimeout(timer); if (open) {page.value = 1; search.value = ''; load()}}, {immediate: true})
watch(search, () => {if (timer) clearTimeout(timer); page.value = 1; timer = setTimeout(load, 350)})
watch(() => props.filters, () => {page.value = 1; if (props.open) load()}, {deep: true})
onBeforeUnmount(() => {version++; if (timer) clearTimeout(timer)})
const money = (value: number) => new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB'}).format(value)
</script>
