import {Category, CategoryFormData} from "@/types/category";

export function categoryFormUpdate(c: Category): CategoryFormData {
    return {
        id: c.id,
        name: c.name ?? '',
        description: c.description ?? null,
        parent_id: c.parent_id ?? null,
        product_ids: c.product_ids ?? null,

        show_in_catalog_menu: !!c.show_in_catalog_menu,
        show_as_home_banner: !!c.show_as_home_banner,
        is_new_product: !!c.is_new_product,
        is_coming_soon: !!c.is_coming_soon,
        menu_order: c.menu_order ?? null,

        banner_image_desktop: null,
        banner_image_mobile: null,
    }
}


export const categoryToFormData = (data: Record<string, any>): FormData => {
    const formData = new FormData()

    Object.keys(data).forEach(key => {
        const value = data[key]

        // Пропускаем undefined и null
        if (value === undefined || value === null) {
            return
        }

        // Файлы
        if (value instanceof File) {
            formData.append(key, value)
            return
        }

        // Массивы (для product_ids, например)
        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                formData.append(`${key}[${index}]`, item)
            })
            return
        }

        // Объекты (конвертируем в JSON)
        if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value))
            return
        }

        // Булевы значения (Laravel ожидает 0/1)
        if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0')
            return
        }

        // Остальные примитивы
        formData.append(key, String(value))
    })

    return formData
}