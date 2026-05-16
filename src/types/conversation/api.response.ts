import {Conversation} from "@/types/conversation/chat";
import {PaginationMeta} from "@/types/Types";

export interface ConversationApiResponse {
    data: Conversation[],
    meta: PaginationMeta
}