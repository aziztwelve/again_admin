export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    depth: number;
    parent_id?: number;
    show_in_catalog_menu: boolean;
    show_as_home_banner: boolean;
    is_new_product: boolean;
    menu_order: number;

    banner_image_desktop?: string;
    banner_image_mobile?: string;

    desktop_url?: string;
    mobile_url?: string;

    product_ids?: number[];
    children?: Category[];
}
