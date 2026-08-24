<template>
  <div class="mx-auto max-w-6xl space-y-6 p-6">
    <div class="rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 p-6 text-white shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <div><p class="text-sm text-emerald-100">Интеграция доставки</p><h1 class="text-3xl font-semibold">Настройки СДЭК</h1><p class="mt-1 text-sm text-emerald-50">Расчёт тарифов, параметры отправки и статусы заказов</p></div>
        <div class="rounded-lg bg-white/15 px-4 py-2 text-sm">СДЭК API</div>
      </div>
    </div>
    <div class="flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-2 text-sm">
      <a v-for="item in navigation" :key="item.href" :href="item.href" class="rounded-md px-3 py-2 hover:bg-background">{{ item.label }}</a>
    </div>
    <div class="flex items-center justify-between gap-4">
      <p class="text-sm text-muted-foreground">Изменения начинают действовать после сохранения.</p>
      <Button variant="outline" as-child><RouterLink to="/integrations/delivery">Назад</RouterLink></Button>
    </div>

    <Card id="account"><CardHeader><CardTitle>Аккаунт интеграции</CardTitle><CardDescription>Данные выдаёт СДЭК в личном кабинете интеграции.</CardDescription></CardHeader><CardContent class="grid gap-4 md:grid-cols-2">
      <Field label="Аккаунт"><Input v-model="form.account" autocomplete="off"/></Field>
      <Field label="Пароль"><Input v-model="form.secure_password" type="password" placeholder="Оставьте пустым, чтобы не менять" autocomplete="new-password"/></Field>
      <div class="flex items-center gap-3 md:col-span-2"><Switch v-model="form.enabled"/><Label>Интеграция включена</Label></div>
    </CardContent></Card>

    <Card id="sender"><CardHeader><CardTitle>Параметры отправки</CardTitle><CardDescription>Данные попадут в накладную СДЭК.</CardDescription></CardHeader><CardContent class="grid gap-4 md:grid-cols-2">
      <Field label="Код города СДЭК"><Input v-model.number="form.sender.city_code" type="number" placeholder="Например, 137"/></Field>
      <Field label="Название магазина"><Input v-model="form.sender.name" placeholder="AGAIN"/></Field>
      <Field label="Адрес магазина"><Input v-model="form.sender.address" placeholder="Адрес отправки"/></Field>
      <Field label="Почтовый индекс"><Input v-model="form.sender.postal_code"/></Field>
      <Field label="Телефон отправителя"><Input v-model="form.sender.phone"/></Field>
      <Field label="Увеличить срок доставки, дней"><Input v-model.number="form.delivery_days_offset" type="number" min="0"/></Field>
      <Field label="НДС доставки"><select v-model="form.delivery_vat" class="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Не указывать</option><option value="VATX">Без НДС</option><option value="VAT0">НДС 0%</option><option value="VAT5">НДС 5%</option><option value="VAT20">НДС 20%</option></select></Field>
      <Field label="Режимы тарифов"><select v-model="form.tariff_mode" class="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="all">Все тарифы</option><option value="pickup">Только ПВЗ</option><option value="courier">Только курьерские</option></select></Field>
    </CardContent></Card>

    <Card id="tariffs"><CardHeader><CardTitle>Тарифы и габариты</CardTitle><CardDescription>Коды тарифов СДЭК через запятую. Пусто — СДЭК сам вернёт все доступные варианты.</CardDescription></CardHeader><CardContent class="space-y-4">
      <Field label="Коды тарифов"><Input v-model="tariffCodes" placeholder="138, 123, 481"/></Field>
      <div class="grid gap-4 md:grid-cols-4"><Field label="Длина, см"><Input v-model.number="form.default_package.length" type="number" min="1"/></Field><Field label="Ширина, см"><Input v-model.number="form.default_package.width" type="number" min="1"/></Field><Field label="Высота, см"><Input v-model.number="form.default_package.height" type="number" min="1"/></Field><Field label="Вес, г"><Input v-model.number="form.default_package.weight" type="number" min="1"/></Field></div>
    </CardContent></Card>

    <Card id="services"><CardHeader><CardTitle>Дополнительные услуги</CardTitle><CardDescription>Включайте только услуги, предусмотренные вашим договором со СДЭК.</CardDescription></CardHeader><CardContent class="grid gap-4 md:grid-cols-2">
      <Toggle label="Страхование" v-model="form.services.insurance"/><Toggle label="Примерка на дому" v-model="form.services.fitting"/><Toggle label="Частичная доставка" v-model="form.services.partial_delivery"/><Toggle label="Запрет осмотра вложения" v-model="form.services.no_inspection"/><Toggle label="Только ПВЗ с наложенным платежом" v-model="form.cod_pickup_only"/>
      <Field label="Объявленная стоимость, ₽"><Input v-model.number="form.declared_value" type="number" min="0"/></Field>
    </CardContent></Card>

    <Card id="statuses"><CardHeader><CardTitle>Импорт статусов заказов</CardTitle><CardDescription>Статус магазина меняется при получении соответствующего статуса СДЭК.</CardDescription></CardHeader><CardContent class="grid gap-4 md:grid-cols-2">
      <Field v-for="status in statuses" :key="status.code" :label="status.label"><select v-model="form.status_mapping[status.code]" class="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Не менять</option><option v-for="option in cdekStatuses" :key="option" :value="option">{{ option }}</option></select></Field>
    </CardContent></Card>

    <Card id="price"><CardHeader><CardTitle>Модификация стоимости доставки</CardTitle><CardDescription>Правила применяются после расчёта тарифа СДЭК.</CardDescription></CardHeader><CardContent class="grid gap-4 md:grid-cols-2">
      <Field label="Бесплатная доставка от, ₽"><Input v-model.number="form.price_rules.free_from" type="number" min="0"/></Field><Field label="Наценка на доставку"><Input v-model.number="form.price_rules.delivery_markup" type="number" min="0"/></Field>
      <Field label="Тип наценки"><select v-model="form.price_rules.delivery_markup_type" class="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="percent">Процент</option><option value="fixed">Рубли</option></select></Field><Field label="Доп. стоимость от суммы заказа, ₽"><Input v-model.number="form.price_rules.order_threshold" type="number" min="0"/></Field>
      <Field label="Доп. стоимость, ₽"><Input v-model.number="form.price_rules.extra_cost" type="number" min="0"/></Field><Field label="Округление"><select v-model="form.price_rules.rounding" class="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="none">Нет</option><option value="1">До 1 ₽</option><option value="10">До 10 ₽</option><option value="100">До 100 ₽</option></select></Field>
    </CardContent></Card>

    <Card id="advanced"><CardHeader><CardTitle>Дополнительные настройки</CardTitle></CardHeader><CardContent class="space-y-3"><Toggle label="Загружать ПВЗ по всему региону" v-model="form.experimental.pvz_by_region"/><Toggle label="Ограничить самовывоз" v-model="form.experimental.limit_pickup"/></CardContent></Card>
    <div class="sticky bottom-4 flex justify-end rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur"><Button :disabled="saving" @click="save">{{ saving ? 'Сохраняем…' : 'Сохранить настройки' }}</Button></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const Field = { props: ['label'], components: { Label }, template: '<div class="space-y-2"><Label>{{ label }}</Label><slot /></div>' }
const Toggle = { props: ['label', 'modelValue'], emits: ['update:modelValue'], components: { Switch, Label }, template: '<div class="flex items-center gap-3"><Switch :model-value="modelValue" @update:model-value="$emit(\'update:modelValue\', $event)"/><Label>{{ label }}</Label></div>' }
const statuses = [{ code: 'new', label: 'Новый' }, { code: 'processing', label: 'В обработке' }, { code: 'shipped', label: 'Отгружен' }, { code: 'delivered', label: 'Доставлен' }, { code: 'cancelled', label: 'Отменён' }, { code: 'returned', label: 'Возврат' }]
const navigation = [{ href: '#account', label: 'Аккаунт' }, { href: '#sender', label: 'Отправка' }, { href: '#tariffs', label: 'Тарифы' }, { href: '#services', label: 'Услуги' }, { href: '#statuses', label: 'Статусы' }, { href: '#price', label: 'Стоимость' }]
const cdekStatuses = ['Создан', 'Принят на склад отправителя', 'В пути', 'Прибыл в город назначения', 'Готов к выдаче', 'Вручен', 'Удален', 'Возвращен на склад доставки']
const defaults = () => ({ enabled: false, account: '', secure_password: '', sender: { city_code: null, name: '', address: '', postal_code: '', phone: '' }, tariff_mode: 'all', tariff_codes: [] as number[], delivery_days_offset: 0, delivery_vat: '', default_package: { length: 20, width: 10, height: 10, weight: 500 }, services: { insurance: true, fitting: false, partial_delivery: false, no_inspection: false }, cod_pickup_only: false, declared_value: 0, status_mapping: {} as Record<string, string>, price_rules: { free_from: 0, delivery_markup: 0, delivery_markup_type: 'percent', order_threshold: 0, extra_cost: 0, rounding: 'none' }, experimental: { pvz_by_region: false, limit_pickup: false } })
const form = ref(defaults()); const saving = ref(false)
const tariffCodes = computed({ get: () => form.value.tariff_codes.join(', '), set: value => { form.value.tariff_codes = value.split(',').map(x => Number(x.trim())).filter(Number.isFinite) } })
onMounted(async () => { const { data } = await axios.get('cdek/settings'); form.value = { ...defaults(), ...(data.settings ?? {}), sender: { ...defaults().sender, ...(data.settings?.sender ?? {}) }, default_package: { ...defaults().default_package, ...(data.settings?.default_package ?? {}) }, services: { ...defaults().services, ...(data.settings?.services ?? {}) }, status_mapping: data.settings?.status_mapping ?? {}, price_rules: { ...defaults().price_rules, ...(data.settings?.price_rules ?? {}) }, experimental: { ...defaults().experimental, ...(data.settings?.experimental ?? {}) } } })
const save = async () => { saving.value = true; try { await axios.put('cdek/settings', { settings: form.value }) } finally { saving.value = false } }
</script>
