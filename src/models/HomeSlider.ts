type ImagePaths = Record<'md' | 'lg' | 'original' | 'sm', string | undefined>;

export default class HomeSlider {
    id: number | undefined;
    title: string | null | undefined;
    subtitle: string | null | undefined;
    text: string | null | undefined;

    // Desktop изображения
    image_paths: ImagePaths | null | undefined;
    image_urls: object | null | undefined;
    image_url: string | null | undefined;
    image: File | string | null | undefined;

    // Mobile изображения
    mobile_image_paths: ImagePaths | null | undefined;
    mobile_image_urls: object | null | undefined;
    image_mobile: File | string | null | undefined;

    order: number | null | undefined;
    is_active: boolean | undefined;
    created_at: string | undefined;
    updated_at: string | undefined;

    constructor() {
        this.id = undefined;
        this.title = null;
        this.subtitle = null;
        this.text = null;

        // Desktop
        this.image_paths = null;
        this.image_urls = null;
        this.image_url = null;
        this.image = null;

        // Mobile
        this.mobile_image_paths = null;
        this.mobile_image_urls = null;
        this.image_mobile = null;

        this.order = null;
        this.is_active = true;
        this.created_at = undefined;
        this.updated_at = undefined;
    }

    static fromJSON(json: any): HomeSlider {
        const slide = new HomeSlider();
        slide.id = json.id;
        slide.title = json.title ?? null;
        slide.subtitle = json.subtitle ?? null;
        slide.text = json.text ?? null;

        // Desktop изображения
        slide.image_paths = json.image_paths ?? null;
        slide.image_urls = json.image_urls ?? null;
        slide.image = null;

        // Mobile изображения
        slide.mobile_image_paths = json.mobile_image_paths ?? null;
        slide.mobile_image_urls = json.mobile_image_urls ?? null;
        slide.image_mobile = null;

        slide.order = json.order ?? null;
        slide.is_active = json.is_active ?? true;
        slide.created_at = json.created_at;
        slide.updated_at = json.updated_at;
        return slide;
    }

    toFormDataForSave(): FormData {
        const formData = new FormData();

        // Добавляем текстовые поля
        if (this.title !== null) formData.append('title', String(this.title));
        if (this.subtitle !== null) formData.append('subtitle', String(this.subtitle));
        if (this.text !== null) formData.append('text', String(this.text));
        if (this.order !== null) formData.append('order', String(this.order));
        if (this.is_active !== undefined) formData.append('is_active', this.is_active ? '1' : '0');

        // Desktop изображение
        if (this.image instanceof File) {
            formData.append('image', this.image, this.image.name);
        }

        // Mobile изображение
        if (this.image_mobile instanceof File) {
            formData.append('image_mobile', this.image_mobile, this.image_mobile.name);
        }

        return formData;
    }

}