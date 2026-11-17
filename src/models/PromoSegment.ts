/** Сегмент, к которому привязан промокод или акция (краткие данные для списков). */
export interface PromoSegment {
    id: number;
    name: string;
    isActive: boolean;
}

/** Из ответа API: `segments: [{id, name, is_active, pivot}]`. Без сегментов — пустой список. */
export function parsePromoSegments(json: any): PromoSegment[] {
    if (!Array.isArray(json)) {
        return [];
    }

    return json
        .filter((segment: any) => segment && segment.id)
        .map((segment: any) => ({
            id: Number(segment.id),
            name: String(segment.name ?? `Сегмент #${segment.id}`),
            isActive: segment.is_active === undefined ? true : !!segment.is_active,
        }));
}
