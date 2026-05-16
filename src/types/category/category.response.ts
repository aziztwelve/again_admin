import type {PaginationMeta} from "@/types/Types";
import type {Category} from "@/types/category";

export interface CategoryListResponse {
    data: Category[];
    meta: PaginationMeta
}


interface CategoryResponse {
    success: boolean,
    message: string,
}

export interface CategoryCreateResponse extends CategoryResponse {
    data: Category
}

export interface CategoryUpdateResponse extends CategoryResponse {
    data: Category
}