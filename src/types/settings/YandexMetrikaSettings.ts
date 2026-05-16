/**
 * Интерфейс настроек Яндекс.Метрики
 */
export interface YandexMetrikaSettings {
    yandex_metrika_enabled: boolean;
    yandex_metrika_id: string | null;
    yandex_metrika_webvisor: boolean;
    yandex_metrika_clickmap: boolean;
    yandex_metrika_tracklinks: boolean;
    yandex_metrika_accurateTrackBounce: boolean;
}

/**
 * Значения по умолчанию для новых настроек
 */
export const defaultYandexMetrikaSettings: YandexMetrikaSettings = {
    yandex_metrika_enabled: false,
    yandex_metrika_id: null,
    yandex_metrika_webvisor: true,
    yandex_metrika_clickmap: true,
    yandex_metrika_tracklinks: true,
    yandex_metrika_accurateTrackBounce: true,
};

/**
 * Создать объект настроек из JSON ответа сервера
 */
export function createYandexMetrikaSettings(data: any): YandexMetrikaSettings {
    return {
        yandex_metrika_enabled: data?.yandex_metrika_enabled ?? false,
        yandex_metrika_id: data?.yandex_metrika_id ?? null,
        yandex_metrika_webvisor: data?.yandex_metrika_webvisor ?? true,
        yandex_metrika_clickmap: data?.yandex_metrika_clickmap ?? true,
        yandex_metrika_tracklinks: data?.yandex_metrika_tracklinks ?? true,
        yandex_metrika_accurateTrackBounce: data?.yandex_metrika_accurateTrackBounce ?? true,
    };
}