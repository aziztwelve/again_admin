import type { GetGiftCardsParams } from './index'

export interface GiftCardSearchParams extends GetGiftCardsParams {
    total: number
}

// export interface GiftCardFilterForm {
//     search: string
//     status: 'inactive' | 'active' | 'used' | 'cancelled' | 'all'
//     type: 'electronic' | 'plastic' | 'all'
//     date_from: string
//     date_to: string
// }