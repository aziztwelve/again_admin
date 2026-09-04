<template>
  <main class="cdek-page">
    <div class="cdek-content">
      <section class="cdek-card">
        <section class="integration-account">
          <h2>Аккаунт интеграции</h2>
          <div class="field-grid">
            <label class="field"><span>Аккаунт:</span><Input v-model="form.account" placeholder="Укажите аккаунт…" autocomplete="off" /></label>
            <label class="field"><span>Пароль:</span><Input v-model="form.secure_password" type="password" placeholder="Оставьте пустым, чтобы не менять" autocomplete="new-password" /></label>
          </div>
          <p class="help">Используйте идентификатор и secure password, созданные в разделе «Интеграция» личного кабинета СДЭК.</p>
        </section>
        <h1>Параметры отправки</h1>
        <div class="field field--wide city-field">
          <span>Город отправки:</span>
          <div class="city-autocomplete">
            <Input v-model="cityQuery" placeholder="Начните вводить город или адрес склада…" autocomplete="off" @focus="openCities" @click="openCities" @input="onCityInput" @blur="cityOpen = false" @keydown.down.prevent="moveCity(1)" @keydown.up.prevent="moveCity(-1)" @keydown.enter.prevent="pickActiveCity" @keydown.esc="cityOpen = false" />
            <div v-if="cityOpen" class="city-list" @mousedown.prevent>
              <p v-if="cityLoading" class="tariff-empty">Загружаем склады СДЭК…</p>
              <template v-else>
                <button v-for="(warehouse, index) in cities" :key="warehouse.code" type="button" class="city-item" :class="{ active: index === cityIndex }" @mouseenter="cityIndex = index" @click="selectCity(warehouse)">
                  <span class="city-item-title">{{ warehouse.city }}</span>
                  <span class="city-item-region">{{ warehouse.region }}</span>
                  <span class="city-item-address">{{ warehouse.address }}</span>
                </button>
                <p v-if="!cities.length" class="tariff-empty">Склады не найдены — измените запрос.</p>
                <p v-if="cities.length >= cityLimit" class="tariff-empty">Показаны первые {{ cities.length }} складов, уточните запрос.</p>
              </template>
            </div>
          </div>
          <small>Выберите город из списка складов СДЭК — код города подставится автоматически</small>
        </div>
        <div class="field-grid">
          <label class="field"><span>Название магазина:</span><Input v-model="form.sender.name" placeholder="AGAIN" /><small>Название магазина будет передано отправителем в СДЭК</small></label>
          <label class="field"><span>Телефон отправителя:</span><Input v-model="form.sender.phone" placeholder="+7…" /></label>
          <label class="field"><span>Адрес магазина:</span><Input v-model="form.sender.address" placeholder="Адрес отправки" /></label>
        </div>
        <div class="field-grid compact-grid">
          <label class="field"><span>Код города СДЭК:</span><Input v-model.number="form.sender.city_code" type="number" min="1" placeholder="Например, 137" /></label>
          <label class="field"><span>Почтовый индекс:</span><Input v-model="form.sender.postal_code" placeholder="Индекс" /></label>
        </div>
        <div class="tariff-settings-row">
          <Button type="button" class="green-button" :disabled="loadingTariffs" @click="openTariffSettings">{{ loadingTariffs ? 'Обновляем…' : 'Настроить отображение тарифов' }}</Button>
        </div>
        <label class="field field--wide"><span>Выберите режимы тарифов:</span><select v-model="form.tariff_mode"><option value="any">Все тарифы</option><option value="dver">Тарифы от двери</option><option value="sklad">Тарифы от склада</option></select></label>
        <div class="tariffs-heading">
          <label class="field field--wide"><span>Тарифы для бесплатной доставки:</span>
            <div class="tariff-list">
              <label v-for="tariff in tariffs" :key="tariff.code" class="tariff-item">
                <Checkbox
                    :model-value="form.tariff_codes.includes(tariff.code)"
                    @update:model-value="(v: any) => toggleTariff(tariff.code, v)"
                />
                <span class="tariff-name">{{ tariff.name }}</span>
                <span class="tariff-code">{{ tariff.code }}</span>
              </label>
              <p v-if="!tariffs.length && !loadingTariffs" class="tariff-empty">Список тарифов пуст</p>
            </div>
          </label>
        </div>
        <p class="help">Тарифы из списка показываются в checkout с расчётной ценой СДЭК. Порог бесплатной доставки настраивается отдельно в поле «Бесплатная доставка при сумме заказа».</p>
        <div class="settings-grid">
          <label class="check"><input v-model="form.enabled" type="checkbox"><span>Интеграция СДЭК включена</span></label>
          <label class="field"><span>Увеличить время доставки на, дней:</span><Input v-model.number="form.delivery_days_offset" type="number" min="0" /></label>
          <label class="field"><span>Вес по умолчанию, г:</span><Input v-model.number="form.default_package.weight" type="number" min="1" /></label>
          <label class="field"><span>Вес по умолчанию применять:</span><select v-model="form.default_weight_scope"><option value="item">к каждому товару без веса</option><option value="order">один раз ко всему заказу</option></select></label>
          <label class="field"><span>Длина, см:</span><Input v-model.number="form.default_package.length" type="number" min="0.1" /></label>
          <label class="field"><span>Ширина, см:</span><Input v-model.number="form.default_package.width" type="number" min="0.1" /></label>
          <label class="field"><span>Высота, см:</span><Input v-model.number="form.default_package.height" type="number" min="0.1" /></label>
        </div>
        <section class="restored-section"><h2>Дополнительные услуги</h2><label class="check"><input checked disabled type="checkbox"><span>Страхование</span></label><p class="help">Страховка СДЭК считается от объявленной стоимости товара.</p><div class="field-grid"><label class="field"><span>Объявленная стоимость, %:</span><Input v-model.number="form.declared.percent" type="number" min="0" max="100" /></label><label class="field"><span>Фиксированная объявленная стоимость, ₽:</span><Input v-model.number="form.declared.value" type="number" min="0" /></label><label class="field"><span>НДС для доплаты за доставку:</span><select v-model="form.delivery_vat"><option :value="null">без НДС</option><option v-for="rate in [0,5,7,10,16,22]" :key="rate" :value="rate">{{ rate }}%</option></select></label></div><div class="checks"><label class="check"><input v-model="form.services.fitting" type="checkbox"><span>ПРИМЕРКА НА ДОМУ</span></label><label class="check"><input v-model="form.services.partial_delivery" type="checkbox"><span>ЧАСТИЧНАЯ ДОСТАВКА</span></label><label class="check"><input v-model="form.services.no_inspection" type="checkbox"><span>ЗАПРЕТ ОСМОТРА ВЛОЖЕНИЯ</span></label><label class="check"><input v-model="form.cod_pickup_only" type="checkbox"><span>Показывать ПВЗ с безналичной оплатой (для наложенного платежа)</span></label></div></section>
        <section class="restored-section"><h2>Импортировать статусы заказов</h2><label class="check"><input v-model="form.use_import" type="checkbox"><span>Обновлять заказы в системе при изменении трекинга СДЭК</span></label><div v-if="form.use_import" class="status-table"><div v-for="status in shopStatuses" :key="status.code" class="status-row"><label>{{ status.label }}</label><select v-model="form.status_mapping[status.code]"><option value="0">нет</option><option v-for="option in cdekStatuses" :key="option.code" :value="String(option.code)">{{ option.label }}</option></select></div></div></section>
        <section class="restored-section"><h2>Модификация стоимости доставки</h2><div class="field-grid"><label class="field"><span>Бесплатная доставка при сумме заказа:</span><Input v-model.number="form.price_rules.threshold" type="number" min="0" /></label><label class="field"><span>Увеличить стоимость доставки на:</span><Input v-model.number="form.price_rules.add_cost" type="number" min="0" /></label><label class="field"><span>Увеличить стоимость заказа (РКО) на:</span><Input v-model.number="form.price_rules.add_rko" type="number" min="0" /></label><label class="field"><span>Доп. стоимость доставки, ₽:</span><Input v-model.number="form.price_rules.add_drc" type="number" min="0" /></label><label class="field"><span>Порог суммы заказа:</span><Input v-model.number="form.price_rules.add_drc_adv" type="number" min="0" /></label><label class="field"><span>Округлять полученные значения:</span><select v-model="form.price_rules.rounded"><option value="0">нет</option><option value="1">в большую сторону</option><option value="2">в меньшую сторону</option></select></label></div></section>
        <section class="restored-section"><h2>Экспериментальные возможности</h2><p>Ограничение загрузки ПВЗ</p><label class="check"><input v-model="form.experimental.limitation_locality_mode" type="radio" value="region"><span>по региону</span></label><label class="check"><input v-model="form.experimental.limitation_locality_mode" type="radio" value="city"><span>по городу</span></label></section>
        <div class="actions"><Button class="green-button" :disabled="saving" @click="save">{{ saving ? 'Сохраняем…' : 'Сохранить изменения' }}</Button></div>
      </section>
    </div>
    <div v-if="tariffDialogOpen" class="modal-backdrop" @click.self="tariffDialogOpen = false">
      <section class="tariff-dialog" role="dialog" aria-modal="true" aria-labelledby="tariff-dialog-title">
        <button class="close" type="button" aria-label="Закрыть" @click="tariffDialogOpen = false">×</button><h2 id="tariff-dialog-title">Настройка отображения тарифов</h2>
        <div class="dialog-top">
          <div class="dialog-settings"><p>Настройки отображения тарифов</p><fieldset><legend>В качестве названия тарифа использовать:</legend><label><input v-model="form.tariff_display.name_source" type="radio" value="delivery"> название доставки из настроек доставки</label><label><input v-model="form.tariff_display.name_source" type="radio" value="full"> полное Название тарифа</label><label><input v-model="form.tariff_display.name_source" type="radio" value="short"> короткое Название тарифа</label></fieldset><fieldset><legend>В качестве описания тарифа использовать:</legend><label><input v-model="form.tariff_display.description_source" type="radio" value="delivery"> название доставки из настроек доставки</label><label><input v-model="form.tariff_display.description_source" type="radio" value="full"> полное Название тарифа</label><label><input v-model="form.tariff_display.description_source" type="radio" value="short"> короткое Название тарифа</label><label><input v-model="form.tariff_display.description_source" type="radio" value="description"> описание доставки из настроек доставки</label></fieldset><label class="check"><input v-model="form.tariff_display.show_label" type="checkbox"><span>Использовать для тарифов надпись «Тариф»</span></label><Button type="button" class="green-button" :disabled="saving" @click="saveTariffDisplay">{{ saving ? 'Сохраняем…' : 'Сохранить изменения' }}</Button></div>
          <div class="preview"><p>Примерно как это будет отображаться на сайте</p><div v-for="tariff in previewTariffs" :key="tariff.code" class="preview-item"><i></i><div><b>{{ previewName(tariff) }}</b><span>{{ previewDescription(tariff) }}</span><small>от 2 до 3 рабочих дней</small></div><strong>+ {{ tariff.price }} руб</strong></div></div>
        </div>
        <label class="check used-only"><input v-model="form.tariff_display.used_only" type="checkbox"><span>Отображать только используемые тарифы</span></label>
        <div class="custom-tariffs"><div class="custom-head"><b>Название тарифа</b><b>Краткое название тарифа</b><b>Новое название</b><b>Новое краткое название тарифа</b></div><div v-for="tariff in modalTariffs" :key="tariff.code" class="custom-row"><span>{{ tariff.name }}</span><span>{{ shortName(tariff.name) }}</span><Input v-model="form.tariff_display.custom_names[tariff.code].name" /><Input v-model="form.tariff_display.custom_names[tariff.code].short_name" /></div></div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
type Tariff = { code: number; name: string }
type Warehouse = { code: string; type?: string | null; city: string; city_code: number; region?: string; address?: string; postal_code?: string }
const shopStatuses = [{ code: 'new', label: 'Новый' }, { code: 'processing', label: 'В обработке' }, { code: 'approved', label: 'Согласован' }, { code: 'shipped', label: 'Отгружен' }, { code: 'exported', label: 'Отгружен на экспорт' }, { code: 'delivered', label: 'Доставлен' }, { code: 'return_process', label: 'В процессе возврата' }, { code: 'cancelled', label: 'Отменен' }, { code: 'returned', label: 'Возврат' }]
const cdekStatuses = [[1, 'Создан'], [2, 'Удален'], [3, 'Принят на склад отправителя'], [4, 'Вручен'], [5, 'Не вручен'], [18, 'Возвращен на склад доставки'], [29, 'Заложен в постамат']].map(([code, label]) => ({ code, label }))
const defaultForm = () => ({ enabled: false, account: '', secure_password: '', sender: { city_code: null as number | null, city_name: '', name: '', phone: '', address: '', postal_code: '' }, tariff_mode: 'any', tariff_codes: [] as number[], delivery_days_offset: 0, default_weight_scope: 'item', delivery_vat: null as number | null, default_package: { length: 26, width: 21, height: 4, weight: 80 }, services: { fitting: false, partial_delivery: false, no_inspection: false }, cod_pickup_only: false, declared: { percent: 0, value: 0 }, use_import: true, status_mapping: { new: '0', processing: '1', approved: '0', shipped: '3', exported: '0', delivered: '4', return_process: '0', cancelled: '2', returned: '18' } as Record<string, string>, price_rules: { threshold: 0, add_cost: 0, add_rko: 0, add_drc: 0, add_drc_adv: 0, rounded: '0' }, experimental: { limitation_locality_mode: 'city' }, tariff_display: { name_source: 'delivery', description_source: 'full', show_label: true, used_only: true, custom_names: {} as Record<number, { name: string; short_name: string }> } })
const form = ref(defaultForm()); const saving = ref(false); const loadingTariffs = ref(false); const tariffDialogOpen = ref(false); const tariffs = ref<Tariff[]>([]); const api = 'third-party-integrations/cdek'
const cityQuery = ref(''); const cityOpen = ref(false); const cityIndex = ref(-1); const cityLoading = ref(false); const cities = ref<Warehouse[]>([]); const cityLimit = 100
let cityTimer: ReturnType<typeof setTimeout> | null = null
let lastCityQuery: string | null = null
const loadCities = async () => {
  cityLoading.value = true
  const query = cityQuery.value.trim()
  lastCityQuery = query
  try {
    const { data } = await axios.get(`${api}/warehouses`, { params: { query, limit: cityLimit } })
    cities.value = data.warehouses ?? []
    cityIndex.value = cities.value.length ? 0 : -1
  } finally { cityLoading.value = false }
}
const onCityInput = () => { if (cityTimer) clearTimeout(cityTimer); cityTimer = setTimeout(loadCities, 300) }
const openCities = () => { cityOpen.value = true; if (lastCityQuery !== cityQuery.value.trim()) loadCities() }
const selectCity = (warehouse: Warehouse) => {
  form.value.sender.city_name = warehouse.city
  form.value.sender.city_code = warehouse.city_code
  cityQuery.value = warehouse.city
  cityOpen.value = false
}
const moveCity = (delta: number) => { if (!cities.value.length) return; cityIndex.value = (cityIndex.value + delta + cities.value.length) % cities.value.length }
const pickActiveCity = () => { const warehouse = cities.value[cityIndex.value]; if (warehouse) selectCity(warehouse) }
const mergeSettings = (settings: any) => { const base = defaultForm(); form.value = { ...base, ...settings, sender: { ...base.sender, ...(settings.sender ?? {}) }, default_package: { ...base.default_package, ...(settings.default_package ?? {}) }, services: { ...base.services, ...(settings.services ?? {}) }, declared: { ...base.declared, ...(settings.declared ?? {}) }, status_mapping: { ...base.status_mapping, ...(settings.status_mapping ?? {}) }, price_rules: { ...base.price_rules, ...(settings.price_rules ?? {}) }, experimental: { ...base.experimental, ...(settings.experimental ?? {}) }, tariff_display: { ...base.tariff_display, ...(settings.tariff_display ?? {}), custom_names: { ...(settings.tariff_display?.custom_names ?? {}) } } } }
const shortName = (name: string) => name.replace(/^(Посылка|Экономичная посылка|Магистральный экспресс)\s+/i, '')
const modalTariffs = computed(() => form.value.tariff_display.used_only && form.value.tariff_codes.length ? tariffs.value.filter((tariff) => form.value.tariff_codes.includes(tariff.code)) : tariffs.value)
const previewTariffs = computed(() => (modalTariffs.value.length ? modalTariffs.value : tariffs.value).slice(0, 2).map((tariff, index) => ({ ...tariff, price: index ? 829 : 974 })))
const customName = (tariff: Tariff) => form.value.tariff_display.custom_names[tariff.code]?.name || tariff.name
const customShortName = (tariff: Tariff) => form.value.tariff_display.custom_names[tariff.code]?.short_name || shortName(tariff.name)
const previewName = (tariff: Tariff) => form.value.tariff_display.name_source === 'short' ? customShortName(tariff) : form.value.tariff_display.name_source === 'full' ? customName(tariff) : 'СДЭК: Курьерская доставка'
const previewDescription = (tariff: Tariff) => form.value.tariff_display.description_source === 'short' ? customShortName(tariff) : form.value.tariff_display.description_source === 'delivery' ? 'Курьерская доставка' : customName(tariff)
const ensureCustomNames = () => tariffs.value.forEach((tariff) => { if (!form.value.tariff_display.custom_names[tariff.code]) form.value.tariff_display.custom_names[tariff.code] = { name: '', short_name: '' } })
const loadTariffs = async () => { loadingTariffs.value = true; try { const { data } = await axios.get(`${api}/tariffs`); tariffs.value = data.tariffs ?? []; ensureCustomNames() } finally { loadingTariffs.value = false } }
const toggleTariff = (code: number, checked: any) => {
  const has = form.value.tariff_codes.includes(code)
  if (checked && !has) {
    form.value.tariff_codes = [...form.value.tariff_codes, code]
  } else if (!checked && has) {
    form.value.tariff_codes = form.value.tariff_codes.filter((c) => c !== code)
  }
}
const openTariffSettings = async () => { if (!tariffs.value.length) await loadTariffs(); tariffDialogOpen.value = true }
const save = async () => { saving.value = true; try { await axios.put(`${api}/settings`, { settings: form.value }) } finally { saving.value = false } }
const saveTariffDisplay = async () => { await save(); tariffDialogOpen.value = false }
onMounted(async () => { try { const { data } = await axios.get(`${api}/settings`); mergeSettings(data.settings ?? {}); cityQuery.value = form.value.sender.city_name || '' } finally { await loadTariffs() } })
</script>

<style scoped>
.city-autocomplete{position:relative}.city-list{position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:40;max-height:320px;overflow-y:auto;border:1px solid #c9c9c9!important;border-radius:5px!important;background:#fff!important;padding:6px 0!important;display:flex;flex-direction:column;box-shadow:0 10px 28px rgba(0,0,0,.14)}.city-item{display:grid;grid-template-columns:1fr auto;gap:2px 12px;padding:6px 14px;font-size:14px;color:#45566f;cursor:pointer;text-align:left;background:none;border:0;font-family:inherit}.city-item:hover,.city-item.active{background:#f0f7f1}.city-item-title{font-weight:700;font-size:15px}.city-item-region{color:#8aa39c;font-size:12px;align-self:center}.city-item-address{grid-column:1/-1;color:#7a8a99;font-size:12px}
.cdek-page{min-height:100vh;background:#f3f3f3;color:#050505;padding:36px 24px 60px;font-family:Arial,sans-serif}.cdek-content{max-width:1100px;margin:auto}.cdek-card{background:#f5f5f5;padding:0 0 28px}.cdek-card h1,.restored-section h2{margin:0 0 20px;color:#008b16;font-size:30px}.field{display:flex;flex-direction:column;gap:10px;font-size:16px}.field--wide{margin:0 0 20px}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;margin:0 0 28px}.compact-grid{gap:24px;max-width:620px;margin-top:-12px}.field small,.help{color:#159832;font-size:13px}.field :is(input,select),.tariffs,.status-row select{border:1px solid #c9c9c9!important;border-radius:5px!important;background:#fff!important;color:#45566f!important;font-size:15px!important;box-shadow:none!important}.tariff-settings-row{display:flex;justify-content:flex-end;margin:0 0 14px}.tariff-list{max-height:250px;overflow-y:auto;border:1px solid #c9c9c9!important;border-radius:5px!important;background:#fff!important;padding:6px 0!important;display:flex;flex-direction:column}.tariff-item{display:flex;align-items:center;gap:10px;padding:5px 14px;font-size:15px;color:#45566f;cursor:pointer}.tariff-item:hover{background:#f0f7f1}.tariff-name{flex:1}.tariff-code{color:#8aa39c;font-size:13px}.tariff-empty{padding:10px 14px;color:#8aa39c;font-size:14px}.green-button{background:#20a53a!important;color:#fff!important;border:0!important;border-radius:5px!important;box-shadow:inset 0 0 0 2px rgba(255,255,255,.38)!important}.help{margin:9px 0 22px;color:#079522}.settings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px 24px;border-top:1px solid #ddd;padding-top:25px}.check{display:flex;gap:8px;align-items:center;font-size:15px}.check input{width:16px;height:16px;accent-color:#199c31}.advanced{margin-top:28px;border-top:1px solid #ddd;padding-top:18px}.advanced summary{cursor:pointer;color:#087f1d;font-size:16px}.advanced-fields{margin:18px 0 15px;gap:24px}.restored-section{border-top:1px solid #ddd;margin-top:28px;padding-top:25px}.restored-section h2{font-size:22px}.checks{display:grid;gap:13px;margin-top:18px}.status-table{margin-top:18px;border:1px solid #d4d4d4}.status-row{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:center;padding:10px 14px;border-top:1px solid #ddd}.status-row:first-child{border-top:0}.actions{margin-top:30px}.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:50;padding:35px;overflow:auto}.tariff-dialog{position:relative;max-width:930px;min-height:650px;margin:auto;background:#f4f4f4;border:1px solid #c8c8c8;border-radius:4px;padding:20px 26px 36px;box-shadow:0 8px 30px rgba(0,0,0,.24)}.tariff-dialog h2{text-align:center;color:#008b16;font-size:28px;margin:0 0 20px;padding-bottom:20px;border-bottom:2px solid #dedede}.close{position:absolute;right:15px;top:12px;border:0;background:transparent;color:#777;font-size:32px;cursor:pointer}.dialog-top{display:grid;grid-template-columns:1fr 1fr;gap:50px}.dialog-settings p,.preview>p{margin:0 0 8px;font-size:16px}.dialog-settings fieldset{border:0;padding:0;margin:0 0 12px}.dialog-settings legend{margin-bottom:5px}.dialog-settings fieldset label{display:flex;gap:7px;align-items:center;margin:6px 0}.dialog-settings input[type=radio]{accent-color:#169b31}.preview-item{display:grid;grid-template-columns:20px 1fr auto;gap:12px;align-items:center;margin:36px 0 0}.preview-item b,.preview-item span,.preview-item small{display:block}.preview-item b{font-size:20px}.preview-item span,.preview-item small{margin-top:7px}.preview-item strong{white-space:nowrap;font-size:17px}.preview-item i{width:14px;height:14px;border:1px solid #999;border-radius:50%}.used-only{justify-content:flex-end;margin:30px 0 8px;font-size:16px}.custom-tariffs{border-top:1px solid #d2d2d2;max-height:310px;overflow:auto}.custom-head,.custom-row{display:grid;grid-template-columns:1.1fr 1.1fr 1.15fr 1.4fr;gap:10px;align-items:center;padding:7px 5px;border-bottom:1px solid #d7d7d7}.custom-head{font-size:14px}.custom-row{font-size:15px}.custom-row :deep(input){height:32px!important}.custom-row span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}@media(max-width:760px){.cdek-page{padding:24px 16px}.field-grid,.settings-grid,.dialog-top,.custom-head,.custom-row,.status-row{grid-template-columns:1fr;gap:16px}.tariff-settings-row{justify-content:flex-start}.tariffs-heading{display:flex;flex-direction:column}.modal-backdrop{padding:12px}.tariff-dialog{padding:18px}.used-only{justify-content:flex-start}.preview-item{margin-top:16px}.custom-head{display:none}.custom-row{gap:6px}.custom-row span{white-space:normal}.settings-grid{margin-top:0}}
</style>
