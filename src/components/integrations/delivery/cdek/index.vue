<template>
  <main class="cdek-page">
    <div class="cdek-content">
      <section class="cdek-card">
        <h1>Параметры отправки</h1>
        <label class="field field--wide"><span>Город отправки:</span><Input v-model="form.sender.city_name" placeholder="Начните вводить город…" /></label>
        <div class="field-grid">
          <label class="field"><span>Название магазина:</span><Input v-model="form.sender.name" placeholder="AGAIN" /><small>Название магазина будет отображено на ярлыке</small></label>
          <label class="field"><span>Адрес магазина:</span><Input v-model="form.sender.address" placeholder="Адрес отправки" /></label>
        </div>
        <div class="field-grid compact-grid">
          <label class="field"><span>Код города СДЭК:</span><Input v-model.number="form.sender.city_code" type="number" min="1" placeholder="Например, 137" /></label>
          <label class="field"><span>Почтовый индекс:</span><Input v-model="form.sender.postal_code" placeholder="Индекс" /></label>
        </div>
        <label class="field field--wide"><span>Выберите режимы тарифов:</span><select v-model="form.tariff_mode"><option value="any">Все тарифы</option><option value="dver">Тарифы от двери</option><option value="sklad">Тарифы от склада</option></select></label>
        <div class="tariffs-heading">
          <label class="field field--wide"><span>Тарифы:</span><select v-model="form.tariff_codes" class="tariffs" multiple size="10"><option v-for="tariff in tariffs" :key="tariff.code" :value="tariff.code">{{ tariff.name }}</option></select></label>
          <Button type="button" class="green-button tariff-settings" :disabled="loadingTariffs" @click="openTariffSettings">{{ loadingTariffs ? 'Обновляем…' : 'Настроить отображение тарифов' }}</Button>
        </div>
        <p class="help">Для выбора нескольких тарифов удерживайте клавишу Ctrl / ⌘. В постамат можно заложить заказ, состоящий из одного грузоместа.</p>
        <div class="settings-grid">
          <label class="check"><input v-model="form.enabled" type="checkbox"><span>Интеграция СДЭК включена</span></label>
          <label class="field"><span>Увеличить время доставки на, дней:</span><Input v-model.number="form.delivery_days_offset" type="number" min="0" /></label>
          <label class="field"><span>Вес по умолчанию, г:</span><Input v-model.number="form.default_package.weight" type="number" min="1" /></label>
          <label class="field"><span>Длина, см:</span><Input v-model.number="form.default_package.length" type="number" min="0.1" /></label>
          <label class="field"><span>Ширина, см:</span><Input v-model.number="form.default_package.width" type="number" min="0.1" /></label>
          <label class="field"><span>Высота, см:</span><Input v-model.number="form.default_package.height" type="number" min="0.1" /></label>
        </div>
        <details class="advanced"><summary>Дополнительные настройки</summary><div class="field-grid advanced-fields"><label class="field"><span>Аккаунт интеграции:</span><Input v-model="form.account" autocomplete="off" /></label><label class="field"><span>Пароль:</span><Input v-model="form.secure_password" type="password" placeholder="Оставьте пустым, чтобы не менять" autocomplete="new-password" /></label></div><label class="check"><input v-model="form.use_import" type="checkbox"><span>Обновлять статусы заказов по трекингу СДЭК</span></label></details>
        <div class="actions"><Button class="green-button" :disabled="saving" @click="save">{{ saving ? 'Сохраняем…' : 'Сохранить изменения' }}</Button></div>
      </section>
    </div>
    <div v-if="tariffDialogOpen" class="modal-backdrop" @click.self="tariffDialogOpen = false">
      <section class="tariff-dialog" role="dialog" aria-modal="true" aria-labelledby="tariff-dialog-title">
        <button class="close" type="button" aria-label="Закрыть" @click="tariffDialogOpen = false">×</button><h2 id="tariff-dialog-title">Настройка отображения тарифов</h2>
        <div class="dialog-top">
          <div class="dialog-settings"><p>Настройки отображения тарифов</p><fieldset><legend>В качестве названия тарифа использовать:</legend><label><input v-model="form.tariff_display.name_source" type="radio" value="delivery"> название доставки из настроек доставки</label><label><input v-model="form.tariff_display.name_source" type="radio" value="full"> полное Название тарифа</label><label><input v-model="form.tariff_display.name_source" type="radio" value="short"> короткое Название тарифа</label></fieldset><fieldset><legend>В качестве описания тарифа использовать:</legend><label><input v-model="form.tariff_display.description_source" type="radio" value="delivery"> название доставки из настроек доставки</label><label><input v-model="form.tariff_display.description_source" type="radio" value="full"> полное Название тарифа</label><label><input v-model="form.tariff_display.description_source" type="radio" value="short"> короткое Название тарифа</label><label><input v-model="form.tariff_display.description_source" type="radio" value="description"> описание доставки из настроек доставки</label></fieldset><label class="check"><input v-model="form.tariff_display.show_label" type="checkbox"><span>Использовать для тарифов надпись «Тариф»</span></label><Button type="button" class="green-button" @click="tariffDialogOpen = false">Сохранить изменения</Button></div>
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
type Tariff = { code: number; name: string }
const defaultForm = () => ({ enabled: false, account: '', secure_password: '', sender: { city_code: null as number | null, city_name: '', name: '', address: '', postal_code: '' }, tariff_mode: 'any', tariff_codes: [] as number[], delivery_days_offset: 0, default_package: { length: 26, width: 21, height: 4, weight: 80 }, use_import: true, tariff_display: { name_source: 'delivery', description_source: 'full', show_label: true, used_only: true, custom_names: {} as Record<number, { name: string; short_name: string }> } })
const form = ref(defaultForm()); const saving = ref(false); const loadingTariffs = ref(false); const tariffDialogOpen = ref(false); const tariffs = ref<Tariff[]>([]); const api = 'third-party-integrations/cdek'
const mergeSettings = (settings: any) => { const base = defaultForm(); form.value = { ...base, ...settings, sender: { ...base.sender, ...(settings.sender ?? {}) }, default_package: { ...base.default_package, ...(settings.default_package ?? {}) }, tariff_display: { ...base.tariff_display, ...(settings.tariff_display ?? {}), custom_names: { ...(settings.tariff_display?.custom_names ?? {}) } } } }
const shortName = (name: string) => name.replace(/^(Посылка|Экономичная посылка|Магистральный экспресс)\s+/i, '')
const modalTariffs = computed(() => form.value.tariff_display.used_only && form.value.tariff_codes.length ? tariffs.value.filter((tariff) => form.value.tariff_codes.includes(tariff.code)) : tariffs.value)
const previewTariffs = computed(() => (modalTariffs.value.length ? modalTariffs.value : tariffs.value).slice(0, 2).map((tariff, index) => ({ ...tariff, price: index ? 829 : 974 })))
const customName = (tariff: Tariff) => form.value.tariff_display.custom_names[tariff.code]?.name || tariff.name
const customShortName = (tariff: Tariff) => form.value.tariff_display.custom_names[tariff.code]?.short_name || shortName(tariff.name)
const previewName = (tariff: Tariff) => form.value.tariff_display.name_source === 'short' ? customShortName(tariff) : form.value.tariff_display.name_source === 'full' ? customName(tariff) : 'СДЭК: Курьерская доставка'
const previewDescription = (tariff: Tariff) => form.value.tariff_display.description_source === 'short' ? customShortName(tariff) : form.value.tariff_display.description_source === 'delivery' ? 'Курьерская доставка' : customName(tariff)
const ensureCustomNames = () => tariffs.value.forEach((tariff) => { if (!form.value.tariff_display.custom_names[tariff.code]) form.value.tariff_display.custom_names[tariff.code] = { name: '', short_name: '' } })
const loadTariffs = async () => { loadingTariffs.value = true; try { const { data } = await axios.get(`${api}/tariffs`); tariffs.value = data.tariffs ?? []; ensureCustomNames() } finally { loadingTariffs.value = false } }
const openTariffSettings = async () => { if (!tariffs.value.length) await loadTariffs(); tariffDialogOpen.value = true }
const save = async () => { saving.value = true; try { await axios.put(`${api}/settings`, { settings: form.value }) } finally { saving.value = false } }
onMounted(async () => { try { const { data } = await axios.get(`${api}/settings`); mergeSettings(data.settings ?? {}) } finally { await loadTariffs() } })
</script>

<style scoped>
.cdek-page{min-height:100vh;background:#f3f3f3;color:#050505;padding:36px 24px 60px;font-family:Arial,sans-serif}.cdek-content{max-width:1100px;margin:auto}.cdek-card{background:#f5f5f5;padding:0 0 28px}.cdek-card h1{margin:0 0 20px;color:#008b16;font-size:30px}.field{display:flex;flex-direction:column;gap:10px;font-size:16px}.field--wide{margin:0 0 20px}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;margin:0 0 28px}.compact-grid{gap:24px;max-width:620px;margin-top:-12px}.field small,.help{color:#159832;font-size:13px}.field :is(input,select),.tariffs{border:1px solid #c9c9c9!important;border-radius:5px!important;background:#fff!important;color:#45566f!important;font-size:15px!important;box-shadow:none!important}.tariffs-heading{position:relative}.tariffs{height:250px!important;padding:0 14px!important}.tariffs option{padding:2px 0}.tariff-settings{position:absolute;right:0;top:-45px}.green-button{background:#20a53a!important;color:#fff!important;border:0!important;border-radius:5px!important;box-shadow:inset 0 0 0 2px rgba(255,255,255,.38)!important}.help{margin:9px 0 22px;color:#079522}.settings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px 24px;border-top:1px solid #ddd;padding-top:25px}.check{display:flex;gap:8px;align-items:center;font-size:15px}.check input{width:16px;height:16px;accent-color:#199c31}.advanced{margin-top:28px;border-top:1px solid #ddd;padding-top:18px}.advanced summary{cursor:pointer;color:#087f1d;font-size:16px}.advanced-fields{margin:18px 0 15px;gap:24px}.actions{margin-top:30px}.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:50;padding:35px;overflow:auto}.tariff-dialog{position:relative;max-width:930px;min-height:650px;margin:auto;background:#f4f4f4;border:1px solid #c8c8c8;border-radius:4px;padding:20px 26px 36px;box-shadow:0 8px 30px rgba(0,0,0,.24)}.tariff-dialog h2{text-align:center;color:#008b16;font-size:28px;margin:0 0 20px;padding-bottom:20px;border-bottom:2px solid #dedede}.close{position:absolute;right:15px;top:12px;border:0;background:transparent;color:#777;font-size:32px;cursor:pointer}.dialog-top{display:grid;grid-template-columns:1fr 1fr;gap:50px}.dialog-settings p,.preview>p{margin:0 0 8px;font-size:16px}.dialog-settings fieldset{border:0;padding:0;margin:0 0 12px}.dialog-settings legend{margin-bottom:5px}.dialog-settings fieldset label{display:flex;gap:7px;align-items:center;margin:6px 0}.dialog-settings input[type=radio]{accent-color:#169b31}.preview-item{display:grid;grid-template-columns:20px 1fr auto;gap:12px;align-items:center;margin:36px 0 0}.preview-item b,.preview-item span,.preview-item small{display:block}.preview-item b{font-size:20px}.preview-item span,.preview-item small{margin-top:7px}.preview-item strong{white-space:nowrap;font-size:17px}.preview-item i{width:14px;height:14px;border:1px solid #999;border-radius:50%}.used-only{justify-content:flex-end;margin:30px 0 8px;font-size:16px}.custom-tariffs{border-top:1px solid #d2d2d2;max-height:310px;overflow:auto}.custom-head,.custom-row{display:grid;grid-template-columns:1.1fr 1.1fr 1.15fr 1.4fr;gap:10px;align-items:center;padding:7px 5px;border-bottom:1px solid #d7d7d7}.custom-head{font-size:14px}.custom-row{font-size:15px}.custom-row :deep(input){height:32px!important}.custom-row span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}@media(max-width:760px){.cdek-page{padding:24px 16px}.field-grid,.settings-grid,.dialog-top,.custom-head,.custom-row{grid-template-columns:1fr;gap:16px}.tariff-settings{position:static;margin:0 0 12px}.tariffs-heading{display:flex;flex-direction:column}.modal-backdrop{padding:12px}.tariff-dialog{padding:18px}.used-only{justify-content:flex-start}.preview-item{margin-top:16px}.custom-head{display:none}.custom-row{gap:6px}.custom-row span{white-space:normal}.settings-grid{margin-top:0}}
</style>
