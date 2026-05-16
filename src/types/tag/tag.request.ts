export interface CreateTagRequest {
    name: string
    color?: string
}

export interface UpdateTagRequest {
    name?: string
    color?: string
}

export interface AttachTagsRequest {
    tag_ids: number[]
}

export interface AttachTagRequest {
    tag_id: number
}