<template>
  <Button :variant="compact ? 'ghost' : 'outline'" :size="compact ? 'icon' : 'default'" aria-label="Экспорт сегмента в CSV" @click="open = true">
    <Download class="h-4 w-4" /><span v-if="!compact" class="ml-2">Экспорт CSV</span>
  </Button>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-5xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Экспорт сегмента «{{ name }}»</DialogTitle>
        <DialogDescription>Список на момент выгрузки, включая закреплённых вручную. Экспорт не запускает пересчёт сегмента.</DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 sm:grid-cols-3">
        <label class="space-y-1 text-sm">Режим
          <select v-model="channel" class="w-full rounded border p-2"><option value="all">Полный список</option><option value="email">Email-рассылка</option><option value="whatsapp">WhatsApp-рассылка</option></select>
        </label>
        <label class="space-y-1 text-sm">Кого включить
          <select v-model="origin" class="w-full rounded border p-2"><option value="all">Всех участников</option><option value="manual">Только добавленных вручную</option><option value="auto">Только по условиям</option></select>
        </label>
        <label class="space-y-1 text-sm">Разделитель
          <select v-model="delimiter" class="w-full rounded border p-2"><option value=";">Точка с запятой ;</option><option value=",">Запятая ,</option></select>
        </label>
      </div>
      <div v-if="channel !== 'all'" class="flex flex-wrap gap-4 text-sm">
        <label class="flex items-center gap-2"><input v-model="consentOnly" type="checkbox" />Только подписанные на {{ channel === 'email' ? 'Email' : 'WhatsApp' }}</label>
        <label class="flex items-center gap-2"><input v-model="deduplicate" type="checkbox" />Без повторяющихся контактов</label>
      </div>
      <p v-if="channel === 'whatsapp'" class="text-sm text-muted-foreground">Подписка WhatsApp отмечается отдельно в карточке клиента. Уведомления о заказах не считаются подпиской на рассылку. Наличие телефона не проверяет регистрацию в WhatsApp.</p>
      <fieldset>
        <legend class="mb-2 text-sm font-medium">Поля файла</legend>
        <div class="grid gap-2 sm:grid-cols-3">
          <label v-for="(label, key) in fieldLabels" :key="key" class="flex items-center gap-2 text-sm">
            <input v-model="columns" type="checkbox" :value="key" :disabled="key === requiredContact" />{{ label }}
          </label>
        </div>
      </fieldset>
      <p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>
      <Button :disabled="loading || !columns.length" variant="outline" @click="loadPreview">{{ loading ? 'Подготовка…' : 'Предпросмотр' }}</Button>
      <template v-if="preview">
        <div class="text-sm" aria-live="polite">
          В сегменте: {{ preview.segment_count }} · В CSV: {{ preview.total_count }}.
          Исключено: другой способ добавления — {{ preview.skipped.origin }},
          нет корректного контакта — {{ preview.skipped.invalid_contact }},
          нет подписки — {{ preview.skipped.no_subscription }}, повтор — {{ preview.skipped.duplicate }}.
        </div>
        <p class="text-xs text-muted-foreground">Последний пересчёт: {{ preview.last_recalculated_at ? new Date(preview.last_recalculated_at).toLocaleString('ru-RU') : 'ещё не выполнялся' }}. Предпросмотр — первые 10 строк; файл содержит весь выбранный список.</p>
        <div v-if="preview.preview.length" class="overflow-x-auto">
          <table class="w-full text-sm"><thead><tr><th v-for="header in Object.values(preview.headers)" :key="header" class="border-b p-2 text-left">{{ header }}</th></tr></thead>
            <tbody><tr v-for="(row, i) in preview.preview" :key="i"><td v-for="(cell, j) in row" :key="j" class="border-b p-2">{{ cell }}</td></tr></tbody>
          </table>
        </div>
        <p v-else class="text-sm">По этим настройкам нет клиентов для выгрузки.</p>
      </template>
      <DialogFooter>
        <Button variant="outline" :disabled="downloading" @click="open = false">Закрыть</Button>
        <Button :disabled="!preview?.total_count || loading || downloading" @click="download">{{ downloading ? 'Выгрузка…' : 'Скачать CSV' }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import axios from 'axios';
import { Download } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
const props = defineProps<{segmentId: number; name: string; compact?: boolean}>();
const open=ref(false),channel=ref('all'),origin=ref('all'),delimiter=ref(';');
const consentOnly=ref(true),deduplicate=ref(true),loading=ref(false),downloading=ref(false),error=ref('');
const fieldLabels: Record<string,string>={id:'ID',full_name:'ФИО',email:'Email',phone:'Телефон',birthday:'Дата рождения',address:'Адрес',registered_at:'Дата регистрации',orders_count:'Количество покупок',total_amount:'Сумма покупок',average_check:'Средний чек',segment_name:'Сегмент',membership_source:'Добавление',added_to_segment_at:'Дата добавления',subscribed_to_newsletter:'Подписка Email',subscribed_to_whatsapp:'Подписка WhatsApp',personal_data_consent:'Согласие ПДн',tags:'Теги'};
const columns=ref<string[]>(Object.keys(fieldLabels));
const requiredContact=computed(()=>channel.value==='email'?'email':channel.value==='whatsapp'?'phone':null);
interface Preview {preview: string[][]; headers: Record<string,string>; total_count:number; segment_count:number; skipped:Record<string,number>; last_recalculated_at:string|null}
const preview=ref<Preview|null>(null);
let requestId=0;
const params=()=>({channel:channel.value,origin:origin.value,delimiter:delimiter.value,consent_only:consentOnly.value?1:0,deduplicate:deduplicate.value?1:0,columns:[...columns.value]});
watch(channel,()=>{columns.value=channel.value==='all'?Object.keys(fieldLabels):['id','full_name',requiredContact.value!];});
watch([channel,origin,delimiter,consentOnly,deduplicate,columns],()=>{requestId++;preview.value=null;loading.value=false;error.value='';},{deep:true});
async function loadPreview(){
  const id=++requestId;loading.value=true;error.value='';preview.value=null;
  try {const response=await axios.get(`segments/${props.segmentId}/export-preview`,{params:params()});if(id===requestId)preview.value=response.data.data;}
  catch(e:any){if(id===requestId)error.value=e.response?.data?.message||'Не удалось подготовить предпросмотр';}
  finally{if(id===requestId)loading.value=false;}
}
async function download(){
  if(downloading.value || !preview.value?.total_count)return;
  downloading.value=true;error.value='';
  const exportParams=params();
  try {
    const response=await axios.get(`segments/${props.segmentId}/export`,{params:exportParams,responseType:'blob'});
    const url=URL.createObjectURL(response.data),link=document.createElement('a');
    link.href=url;link.download=`segment_${props.segmentId}_${exportParams.channel}.csv`;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
  } catch {error.value='Не удалось скачать CSV. Обновите предпросмотр и повторите.';}
  finally{downloading.value=false;}
}
</script>
