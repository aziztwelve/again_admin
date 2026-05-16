import {ref} from 'vue'
import axios from 'axios'
import {Product} from '@/models/Product'
import {useErrorHandler} from "@/composables/useErrorHandler";
import {useSuccessHandler} from "@/composables/useSuccessHandler";

export function useProductImageUploader() {
    const sending = ref(false)
    const progress = ref(0)

    const setImagesWithProduct = async (product: Product) => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        try {
            const formData = new FormData()

            for (const image of product.images ?? []) {
                if (image.file) {
                    formData.append('product_images[]', image.file, image.file.name)
                }
            }

            for (const variant of product.variants) {
                for (const image of variant.images ?? []) {
                    if (image.file) {
                        formData.append(
                            `variant_images_${variant.uuid}[]`,
                            image.file,
                            image.file.name
                        )
                    }
                }
            }

            const payload = product.toJSONForCreate() || {}

            for (const [key, value] of Object.entries(payload)) {
                if (key === 'variants' && Array.isArray(value)) {
                    value.forEach((variant, index) => {
                        for (const [vKey, vValue] of Object.entries(variant)) {
                            const formattedKey = `variants[${index}][${vKey}]`;

                            if (Array.isArray(vValue)) {
                                vValue.forEach(item => {
                                    formData.append(`${formattedKey}[]`, String(item));
                                });
                            } else if (typeof vValue === 'object' && vValue !== null) {
                                formData.append(formattedKey, JSON.stringify(vValue));
                            } else {
                                formData.append(formattedKey, String(vValue));
                            }
                        }
                    });
                } else if (key === 'colors' && Array.isArray(value)) {
                    value.forEach((color, index) => {
                        for (const [colorKey, colorValue] of Object.entries(color)) {
                            formData.append(`colors[${index}][${colorKey}]`, String(colorValue));
                        }
                    });
                } else if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        formData.append(`${key}[${index}]`, String(item));
                    });
                } else if (typeof value === 'object' && value !== null) {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            }


            const response = await axios.post('/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (e) => {
                    if (e.total) {
                        progress.value = Math.round((e.loaded * 100) / e.total)
                    }
                },
            })

            useSuccessHandler().showSuccess(response)

            return response.data

        } catch (error: any) {
            useErrorHandler().showError(error)
            throw error
        } finally {
            sending.value = false
        }
    }



    const updateImagesWithProduct = async (product: Product) => {
        if (!product || sending.value) return

        sending.value = true
        progress.value = 0

        try {
            const formData = new FormData()
            const mapPosition: Record<string, number> = {}

            const productImageFiles: File[] = []
            const productImagePaths: string[] = []

            // Product images
            product.images?.forEach((img, index) => {
                if (img.file) {
                    formData.append('product_images[]', img.file, img.file.name)
                    productImageFiles.push(img.file)
                    mapPosition[`product_image_file_${productImageFiles.length - 1}`] = index
                }
                if (img.path) {
                    formData.append('images[]', img.path)
                    productImagePaths.push(img.path)
                    mapPosition[`product_image_path_${img.path}`] = index
                }
            })

            // Variant images
            for (const variant of product.variants || []) {
                const variantImageFiles: File[] = []
                const variantImagePaths: string[] = []

                for (let i = 0; i < (variant.images?.length || 0); i++) {
                    const img = variant.images![i]
                    if (img.file) {
                        formData.append(`variant_images_${variant.uuid}[]`, img.file, img.file.name)
                        variantImageFiles.push(img.file)
                        mapPosition[`variant_${variant.uuid}_image_file_${variantImageFiles.length - 1}`] = i
                    }
                    if (img.path) {
                        formData.append(`variant_name_images_${variant.uuid}[]`, img.path)
                        variantImagePaths.push(img.path)
                        mapPosition[`variant_${variant.uuid}_image_path_${img.path}`] = i
                    }
                }
            }

            // Add product payload
            const payload = product.toJSONForCreate()

            for (const [key, value] of Object.entries(payload)) {
                if (value === null || value === undefined) continue;

                if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        if (item === null || item === undefined) return;
                        if (typeof item === 'object') {
                            for (const [k, v] of Object.entries(item)) {
                                if (v === null || v === undefined) continue;
                                formData.append(`${key}[${index}][${k}]`, String(v))
                            }
                        } else {
                            formData.append(`${key}[${index}]`, String(item))
                        }
                    })
                } else if (typeof value === 'object') {
                    formData.append(key, JSON.stringify(value))
                } else {
                    formData.append(key, String(value))
                }
            }


            // Add image positions
            for (const [key, val] of Object.entries(mapPosition)) {
                formData.append(key, val.toString())
            }

            // Upload
            const response = await axios.post(`/products/update/${product.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    if (e.total) {
                        progress.value = Math.round((e.loaded * 100) / e.total)
                    }
                }
            })

            useSuccessHandler().showSuccess(response)
            return response.data

        } catch (error: any) {
            useErrorHandler().showError(error)
            throw error
        } finally {
            sending.value = false
        }
    }


    const getImageByName = async (name: string) => {
        const response = await axios.get('/products/image' + name);
    }




    return {
        sending,
        progress,
        setImagesWithProduct,
        updateImagesWithProduct,
        getImageByName
    }
}
