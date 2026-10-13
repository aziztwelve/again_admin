<template>
  <Card>
    <CardHeader class="flex flex-row items-start justify-between gap-4">
      <div>
        <CardTitle>Акции сегмента</CardTitle>
        <CardDescription class="mt-2">
          Привязанная акция доступна клиентам хотя бы одного активного сегмента.
          Условия самой акции также должны выполняться.
        </CardDescription>
      </div>
      <Button :disabled="saving" @click="openManager">Добавить / убрать акции</Button>
    </CardHeader>
    <CardContent>
      <p v-if="!promotions.length" class="text-sm text-muted-foreground">Акции пока не добавлены</p>
      <ul v-else class="space-y-3">
        <li v-for="promotion in promotions" :key="promotion.id" class="flex justify-between gap-4 border-b pb-3">
          <span>{{ promotion.name }}</span>
          <Badge variant="secondary">{{ status(promotion) }}</Badge>
        </li>
      </ul>
    </CardContent>
  </Card>

  <Dialog v-model:open="open">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Акции для сегмента</DialogTitle>
        <DialogDescription>
          Выберите существующие акции и сохраните изменения.
          Если убрать последнюю привязку акции к сегментам, она станет доступна всем.
        </DialogDescription>
      </DialogHeader>
      <div class="flex gap-2">
        <Input v-model="search" placeholder="Поиск по названию" aria-label="Название акции" @keyup.enter="loadPage(1)" />
        <Button variant="outline" :disabled="loading" @click="loadPage(1)">Найти</Button>
      </div>
      <p class="text-sm">Выбрано: {{ selected.length }}</p>
      <p v-if="loadError" class="text-sm text-red-600" role="alert">{{ loadError }}</p>
      <div class="max-h-80 overflow-y-auto space-y-2" :aria-busy="loading">
        <p v-if="loading" class="text-sm text-muted-foreground">Загрузка…</p>
        <template v-else>
          <p v-if="!options.length" class="text-sm text-muted-foreground">Акции не найдены</p>
          <label v-for="promotion in options" :key="promotion.id" class="flex items-center gap-3 rounded border p-3 cursor-pointer">
            <input v-model="selected" type="checkbox" :value="promotion.id" :disabled="saving" />
            <span class="flex-1">{{ promotion.name }}</span>
            <Badge variant="secondary">{{ status(promotion) }}</Badge>
          </label>
        </template>
      </div>
      <div class="flex items-center justify-between gap-2">
        <Button variant="outline" :disabled="loading || page <= 1" @click="loadPage(page - 1)">Назад</Button>
        <span class="text-sm">{{ page }} / {{ lastPage }}</span>
        <Button variant="outline" :disabled="loading || page >= lastPage" @click="loadPage(page + 1)">Далее</Button>
      </div>
      <DialogFooter>
        <Button variant="outline" :disabled="saving" @click="open = false">Отмена</Button>
        <Button :disabled="saving || loading || !!loadError" @click="save">{{ saving ? 'Сохранение…' : 'Сохранить' }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ref } from 'vue';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useErrorHandler } from '@/composables/useErrorHandler';
import { useSuccessHandler } from '@/composables/useSuccessHandler';
import type { SegmentPromotionBrief } from '@/features/segment/types';

const props = defineProps<{ segmentId: number; promotions: SegmentPromotionBrief[] }>();
const emit = defineEmits<{ updated: [] }>();
const open = ref(false);
const loading = ref(false);
const saving = ref(false);
const search = ref('');
const selected = ref<number[]>([]);
const options = ref<SegmentPromotionBrief[]>([]);
const page = ref(1);
const lastPage = ref(1);
const loadError = ref('');
let requestId = 0;

function status(promotion: SegmentPromotionBrief): string {
  if (!promotion.is_active) return 'Выключена';
  if (promotion.ends_at && Date.parse(promotion.ends_at) < Date.now()) return 'Завершена';
  if (promotion.starts_at && Date.parse(promotion.starts_at) > Date.now()) return 'Запланирована';
  return 'Включена';
}

async function loadPage(nextPage: number) {
  const currentRequest = ++requestId;
  loading.value = true;
  loadError.value = '';
  try {
    const response = await axios.get('promotions', { params: { search: search.value, page: nextPage, per_page: 15 } });
    if (currentRequest !== requestId) return;
    const result = response.data.data;
    options.value = result.data;
    page.value = result.current_page;
    lastPage.value = result.last_page;
  } catch (error) {
    if (currentRequest !== requestId) return;
    loadError.value = 'Не удалось загрузить акции. Повторите поиск.';
    useErrorHandler().showError(error);
  } finally {
    if (currentRequest === requestId) loading.value = false;
  }
}

function openManager() {
  selected.value = props.promotions.map(promotion => promotion.id);
  search.value = '';
  open.value = true;
  loadPage(1);
}

async function save() {
  if (saving.value) return;
  saving.value = true;
  try {
    const response = await axios.put(`segments/${props.segmentId}/promotions`, { promotion_ids: selected.value });
    useSuccessHandler().showSuccess(response);
    open.value = false;
    emit('updated');
  } catch (error) {
    useErrorHandler().showError(error);
  } finally {
    saving.value = false;
  }
}
</script>
