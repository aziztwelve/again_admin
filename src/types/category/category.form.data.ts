export interface CategoryFormData {
    id?: number;
    name: string;
    description: string | null;
    parent_id: number | null;
    product_ids: number[] | null;

    show_in_catalog_menu: boolean;
    show_as_home_banner: boolean;
    is_new_product: boolean;
    menu_order: number | null;

    banner_image_desktop: File | null | string;
    banner_image_mobile: File | null | string;

    remove_banner_image_desktop?: boolean;
    remove_banner_image_mobile?: boolean;
}


export const initialCategoryFormData: CategoryFormData = {
    name: '',
    description: null,
    parent_id: null,
    product_ids: [],

    show_in_catalog_menu: false,
    show_as_home_banner: false,
    is_new_product: false,
    menu_order: null,

    banner_image_desktop: null,
    banner_image_mobile: null,
}
