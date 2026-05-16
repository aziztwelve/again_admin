export interface SegmentSearchType {
    page: number;
    per_page: number;
    total: number;
    search?: string;
    is_active?: boolean;
}