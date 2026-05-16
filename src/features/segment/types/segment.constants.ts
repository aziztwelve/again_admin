import type {SegmentFormData} from './segment-form.types'

/**
 * Начальное состояние формы
 */
export const initialSegmentFormData: SegmentFormData = {
    name: '',
    description: '',
    is_active: true,
    recalculate_frequency: 'on_view',
    period: '',
    min_orders_count: null,
    max_orders_count: null,
    min_total_amount: null,
    min_average_check: null,
}

/**
 * Опции для селекта периода
 */
export const PERIOD_OPTIONS = [
    {value: 'all_time', label: 'За всё время'},
    {value: 'last_month', label: 'За последний месяц'},
    {value: 'last_6_months', label: 'За последние 6 месяцев'},
    {value: 'last_year', label: 'За последний год'},
] as const

/**
 * Опции для селекта частоты пересчёта
 */
export const RECALCULATE_FREQUENCY_OPTIONS = [
    {value: 'on_view', label: 'При каждом просмотре'},
    {value: 'manual', label: 'Вручную'},
] as const


export const getRecalculateLabel = (value: string) => {
    const option = RECALCULATE_FREQUENCY_OPTIONS.find(opt => opt.value === value)
    return option?.label ?? ''
}

/**
 * Опции для экспорта (колонки)
 */
export const EXPORT_COLUMNS = [
    {value: 'id', label: 'ID'},
    {value: 'full_name', label: 'ФИО'},
    {value: 'phone', label: 'Телефон'},
    {value: 'email', label: 'Email'},
    {value: 'birthday', label: 'Дата рождения'},
    {value: 'address', label: 'Адрес'},
    {value: 'average_check', label: 'Средний чек'},
    {value: 'total_amount', label: 'Сумма покупок'},
    {value: 'orders_count', label: 'Количество заказов'},
] as const