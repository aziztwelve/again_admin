/**
 * Опции статуса баннера
 */
export const OTO_BANNER_STATUS_OPTIONS = [
    { value: 'active', label: 'Активен' },
    { value: 'inactive', label: 'Неактивен' },
] as const

/**
 * Опции типа устройства
 */
export const OTO_BANNER_DEVICE_TYPE_OPTIONS = [
    { value: 'desktop', label: 'Десктоп' },
    { value: 'mobile', label: 'Мобильный' },
] as const

/**
 * Опции типа поля ввода
 */
export const OTO_BANNER_INPUT_FIELD_TYPE_OPTIONS = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Телефон' },
    { value: 'text', label: 'Текст' },
] as const

/**
 * Опции статуса заявки
 */
export const OTO_BANNER_SUBMISSION_STATUS_OPTIONS = [
    { value: 'new', label: 'Новая' },
    { value: 'viewed', label: 'Просмотрена' },
    { value: 'processed', label: 'Обработана' },
] as const

/**
 * Опции периода для графиков
 */
export const OTO_BANNER_CHART_PERIOD_OPTIONS = [
    { value: 'hour', label: 'По часам' },
    { value: 'day', label: 'По дням' },
    { value: 'month', label: 'По месяцам' },
] as const

/**
 * Получить label статуса
 */
export const getStatusLabel = (value: string): string => {
    const option = OTO_BANNER_STATUS_OPTIONS.find(opt => opt.value === value)
    return option?.label ?? ''
}

/**
 * Получить label типа устройства
 */
export const getDeviceTypeLabel = (value: string): string => {
    const option = OTO_BANNER_DEVICE_TYPE_OPTIONS.find(opt => opt.value === value)
    return option?.label ?? ''
}

/**
 * Получить label типа поля
 */
export const getInputFieldTypeLabel = (value: string): string => {
    const option = OTO_BANNER_INPUT_FIELD_TYPE_OPTIONS.find(opt => opt.value === value)
    return option?.label ?? ''
}

/**
 * Получить label статуса заявки
 */
export const getSubmissionStatusLabel = (value: string): string => {
    const option = OTO_BANNER_SUBMISSION_STATUS_OPTIONS.find(opt => opt.value === value)
    return option?.label ?? ''
}