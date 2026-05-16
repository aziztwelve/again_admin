// === 1) К какому набору товаров относится скидка ===
export enum DiscountTargetType {
    ALL      = 'all',
    SPECIFIC = 'specific',
    CATEGORY = 'category',
}

export const DiscountTargetLabels: Record<DiscountTargetType, string> = {
    [DiscountTargetType.ALL]:      'Ко всем товарам',
    [DiscountTargetType.SPECIFIC]: 'Конкретные товары',
    [DiscountTargetType.CATEGORY]: 'Категории',
};

export const DiscountTargetOptions = Object.entries(DiscountTargetLabels).map(
    ([value, label]) => ({
        value: value as DiscountTargetType,
        label,
    }),
);

export const PromoCodeTargetOptions = Object.entries(DiscountTargetLabels)
    .filter(([value, _label]) => value !== DiscountTargetType.CATEGORY)
    .map(([value, label]) => ({
        value: value as DiscountTargetType,
        label,
    }));



// === 2) Как именно считается скидка ===
export enum DiscountValueType {
    PERCENTAGE = 'percentage',
    FIXED      = 'fixed',
}

export const DiscountValueLabels: Record<DiscountValueType, string> = {
    [DiscountValueType.PERCENTAGE]: 'Процентная',
    [DiscountValueType.FIXED]:      'Фиксированная',
};

export const DiscountValueOptions = Object.entries(DiscountValueLabels).map(
    ([value, label]) => ({
        value: value as DiscountValueType,
        label,
    }),
);

export const getDiscountTargetLabel = (targetType: DiscountTargetType): string => {
    return DiscountTargetLabels[targetType] || targetType;
};

export const getDiscountValueLabel = (valueType: DiscountValueType): string => {
    return DiscountValueLabels[valueType] || valueType;
};