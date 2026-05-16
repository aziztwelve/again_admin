import axios from "axios";
import {toast} from "vue-sonner";
import {ImageModel} from "@/models/ImageModel";
import {useSuccessHandler} from "@/composables/useSuccessHandler";

export function useImageFunctions() {

    // const uploadImage = async (imageableType: string, imageableId: number, imageFile: File): Promise<ImageModel | null> => {
    //
    //   try {
    //     const formData = new FormData();
    //     formData.append('imageable_type', imageableType);
    //     formData.append('imageable_id', imageableId.toString());
    //     formData.append('image', imageFile);
    //
    //     const res = await axios.post(`${config.public.LARAVEL_API}/api/images`, formData, {
    //       headers: {
    //         'Content-Type': 'multipart/form-data'
    //       }
    //     });
    //
    //     if (res.data.success) {
    //       // toast.success(res.data.message);
    //       return ImageModel.fromJSON(res.data.image);
    //     } else {
    //       // toast.error(res.data.message);
    //       return null;
    //     }
    //   } catch (e: any) {
    //     if (e.response) {
    //       toast.error(e.response.data.error);
    //     }
    //     return null;
    //   }
    // };

    const getImages = async (imageableType: string, imageableId: number): Promise<ImageModel[]> => {
        try {
            const res = await axios.get(`${process.env.VUE_APP_BASE_URL}/api/images`, {
                params: {
                    imageable_type: imageableType,
                    imageable_id: imageableId
                }
            });

            if (res.data.success) {
                return res.data.images.map((img: any) => ImageModel.fromJSON(img));
            } else {
                // toast.error(res.data.message);
                return [];
            }
        } catch (e: any) {
            if (e.response) {
                toast.error(e.response.data.error);
            }
            return [];
        }
    };

    const deleteImage = async (imageId: number): Promise<boolean> => {
        try {
            const res = await axios.delete(`${process.env.VUE_APP_BASE_URL}/api/images`, {
                data: {id: imageId}
            });

            if (res.data.status) {
                toast.success(res.data.message);
                return true;
            } else {
                toast.error(res.data.message);
                return false;
            }
        } catch (e: any) {
            if (e.response) {
                toast.error(e.response.data.error);
            }
            return false;
        }
    };

    const uploadImage = async (
        imageableType: string,
        imageableId: number,
        images: Array<{
            file?: File | null;
            name?: string | null;
        }>,
        onProgress?: (progress: number) => void
    ): Promise<boolean> => {
        try {
            const formData = new FormData();
            formData.append('imageable_type', imageableType);
            formData.append('imageable_id', imageableId.toString());

            const existingImages: string[] = [];

            images.forEach((image, index) => {
                if (image.file) {
                    formData.append('images[]', image.file);
                    formData.append(`image_file_${index}`, index.toString());
                }

                if (image.name) {
                    existingImages.push(image.name);
                    formData.append(`image_path_${image.name.replaceAll('.', '_')}`, index.toString());
                }
            });

            existingImages.forEach((img, index) => {
                formData.append(`existing_images[${index}]`, img);
            });

            const res = await axios.post(`${process.env.VUE_APP_BASE_URL}/api/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(progress);
                    }
                }
            });

            if (res.data.success) {
                useSuccessHandler().showSuccess(res)
                onProgress?.(100);
                return true;
            } else {
                toast.error(res.data.message || 'Image upload failed');
                return false;
            }
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Error uploading images');
            return false;
        }
    };


    function getImageByNameProduct(name: string, imageSize = 'md') {
        return `${process.env.VUE_APP_BASE_URL}/product/image/${imageSize}_${name}`;
    }

    function showImage(image: ImageModel, imageSize = 'md') {
        if (image.file) {
            return URL.createObjectURL(image.file);
        }
        return getImageByNameProduct(image.path ?? '', imageSize);
    }


    // function getPreviewUrl = (image: ImageModel) => {
    //   if (image.file) {
    //     return URL.createObjectURL(image.file);
    //   }
    //   if (image.path) {
    //     return props.imageSize
    //         ? image.imageURL(props.imageSize)
    //         : image.path;
    //   }
    //   return '';
    // }


    return {
        uploadImage,
        getImages,
        deleteImage,
        getImageByNameProduct,
        showImage
    };
}
