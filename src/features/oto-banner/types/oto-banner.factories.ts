import type { OtoBannerFormData, OtoBannerSearchParams, OtoBannerSubmissionsParams } from './index'

/**
 * Создать пустую форму баннера
 */
export const createOtoBannerFormData = (): OtoBannerFormData => ({
    name: '',
    status: 'inactive',
    device_type: 'desktop',
    title: '',
    subtitle: '',
    button_enabled: true,
    button_text: 'Отправить',
    input_field_enabled: true,
    input_field_type: 'email',
    input_field_label: '',
    input_field_placeholder: '',
    input_field_required: true,
    display_delay_seconds: 0,
    privacy_text: '',
    segment_ids: [],
    image: null,
})

/**
 * Создать начальные параметры поиска
 */
export const createOtoBannerSearchParams = (): OtoBannerSearchParams => ({
    page: 1,
    per_page: 15,
    total: 0,
    search: undefined,
    status: undefined,
    device_type: undefined,
    date_from: undefined,
    date_to: undefined,
})

/**
 * Создать начальные параметры для заявок
 */
export const createOtoBannerSubmissionsParams = (): OtoBannerSubmissionsParams => ({
    page: 1,
    per_page: 15,
    total: 0,
    banner_id: undefined,
    status: undefined,
    manager_id: undefined,
    search: undefined,
    date_from: undefined,
    date_to: undefined,
})