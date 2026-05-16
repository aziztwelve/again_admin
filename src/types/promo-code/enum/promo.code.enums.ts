export enum PromoCodeDiscountBehavior {
    REPLACE = 'replace', // Заменяет скидку продукта
    STACK = 'stack',     // Добавляется поверх скидки
    SKIP = 'skip',       // Пропускает товары со скидкой
}

export enum PromoCodeType {
    GENERAL = 'general',
    PERSONAL = 'personal',
    SEGMENT = 'segment',
}

export enum PromoCodeTemplateType {
    DEFAULT = 'default',
    BIRTHDAY = 'birthday',
    SEASONAL = 'seasonal',
    WELCOME = 'welcome',
}