export interface Tag {
    id: number
    name: string
    color: string | null
    created_at: string
    updated_at: string
}

export interface TagStatistic extends Tag {
    clients_count?: number
}