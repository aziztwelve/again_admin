import {DeliveryChannel, ResendGiftCardRequest} from "./index";

export function prepareResendGiftCardRequest(data: ResendGiftCardRequest) {
    return {
        delivery_channel: data.delivery_channel,
        recipient_email: data.recipient_email || null,
        recipient_phone: data.recipient_phone || null,
    }
}