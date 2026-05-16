import type {
    OtoBanner,
    OtoBannerFormData,
    CreateOtoBannerRequest,
    UpdateOtoBannerRequest
} from './index'


/**
 * Преобразовать баннер в форму
 */
export const otoBannerToFormData = (banner: OtoBanner): OtoBannerFormData => ({
    name: banner.name,
    status: banner.status,
    device_type: banner.device_type,
    title: banner.title ?? '',
    subtitle: banner.subtitle ?? '',
    button_enabled: banner.button_enabled,
    button_text: banner.button_text ?? 'Отправить',
    input_field_enabled: banner.input_field_enabled,
    input_field_type: banner.input_field_type,
    input_field_label: banner.input_field_label ?? '',
    input_field_placeholder: banner.input_field_placeholder ?? '',
    input_field_required: banner.input_field_required,
    display_delay_seconds: banner.display_delay_seconds,
    privacy_text: banner.privacy_text ?? '',
    segment_ids: banner.segment_ids ?? [],
    promo_code_id: banner.promo_code_id ?? null,

    image: null, // Изображение не преобразуем
})

/**
 * Преобразовать форму в CreateRequest
 */
export const formDataToCreateRequest = (formData: OtoBannerFormData): FormData => {
    const data = new FormData()


    data.append('name', formData.name)
    data.append('status', formData.status)
    data.append('device_type', formData.device_type)

    data.append('title', formData.title ?? '')
    data.append('subtitle', formData.subtitle ?? '')

    data.append('button_enabled', formData.button_enabled ? '1' : '0')
    data.append('button_text', formData.button_text ?? '')

    data.append('input_field_enabled', formData.input_field_enabled ? '1' : '0')
    data.append('input_field_type', formData.input_field_type ?? '')
    data.append('input_field_label', formData.input_field_label ?? '')
    data.append('input_field_placeholder', formData.input_field_placeholder ?? '')
    data.append('input_field_required', formData.input_field_required ? '1' : '0')

    data.append('display_delay_seconds', String(formData.display_delay_seconds))

    data.append('privacy_text', formData.privacy_text ?? '')

    // segment_ids: если хочешь очистить — иногда надо отправить пустой массив/флаг
    // (зависит от API; самый частый вариант — отдельный clear_segments=1)
    if (formData.segment_ids?.length) {
        formData.segment_ids.forEach((id, index) => {
            data.append(`segment_ids[${index}]`, String(id))
        })
    }

    if (formData.promo_code_id !== undefined) {
        data.append('promo_code_id', formData.promo_code_id ? String(formData.promo_code_id) : '');
    }

    if (formData.image) data.append('image', formData.image)

    return data
}


/**
 * Преобразовать форму в UpdateRequest
 */
export const formDataToUpdateRequest = (formData: OtoBannerFormData): FormData => {
    // Для обновления используем ту же логику
    return formDataToCreateRequest(formData)
}