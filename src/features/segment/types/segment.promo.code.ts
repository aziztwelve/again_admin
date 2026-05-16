/**
 * Управление промокодами сегмента
 */
export interface SegmentPromoCodeManager {
    /** ID промокодов, уже прикреплённых к сегменту */
    attached: number[]

    /** ID промокодов, уже прикреплённых к сегменту */
    attachedOriginal: number[]

    /** ID промокодов, ожидающих добавления */
    pendingAttach: number[]

    /** ID промокодов, ожидающих удаления */
    pendingDetach: number[]
}