// src/types/form.ts
export interface FormDynamicFieldType {
    name: string
    label: string
    component: 'text' | 'textarea' | 'select' | 'multiSelect' | 'checkbox' | 'date' | 'file' | 'color' | 'enyComponentSlot'
    type?: string
    placeholder?: string
    description?: string
    required?: boolean
    disabled?: boolean
    cols?: number
    rows?: number
    accept?: string
    cropperAspectRatio?: Number //forFileImage
    cropperShow?: boolean //forFileImage
    cropperAvatar?: boolean //forFileImage
    imagePreview?: boolean //forFileImage

    options?: any[]
    optionLabel?: string
    optionValue?: string
}

export type FieldsProp = (FormDynamicFieldType | FormDynamicFieldType[])[]
