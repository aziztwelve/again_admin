<template>
  <Editor
      v-model="content"
      :init="editorOptions"
      :disabled="disabled"
  />
</template>

<script setup lang="ts">
import {computed} from 'vue'
import axios from 'axios'
import {toast} from 'vue-sonner'
import Editor from '@tinymce/tinymce-vue'
import 'tinymce/tinymce'
import 'tinymce/icons/default'
import 'tinymce/themes/silver'
import 'tinymce/models/dom'
import 'tinymce/skins/ui/oxide/skin.css'
import contentCss from 'tinymce/skins/content/default/content.css?inline'
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/code'
import 'tinymce/plugins/image'
import 'tinymce/plugins/link'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/media'
import 'tinymce/plugins/table'

const props = withDefaults(defineProps<{
  modelValue?: string | null
  disabled?: boolean
  height?: number
}>(), {
  modelValue: '',
  disabled: false,
  height: 420,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const content = computed({
  get: () => props.modelValue ?? '',
  set: (value: string) => emit('update:modelValue', value),
})

const uploadImage = async (blobInfo: any): Promise<string> => {
  const formData = new FormData()
  const file = blobInfo.blob() as File
  formData.append('files[]', file, blobInfo.filename())

  try {
    const {data} = await axios.post('/products/media-library', formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    })
    const url = data?.data?.[0]?.url
    if (!url) throw new Error('Сервер не вернул ссылку на изображение')
    return url
  } catch (error: any) {
    const message = error.response?.data?.message ?? 'Не удалось загрузить изображение'
    toast.error(message)
    throw new Error(message)
  }
}

const editorOptions = computed(() => ({
  height: props.height,
  menubar: 'edit insert format table tools',
  branding: false,
  promotion: false,
  plugins: 'advlist autolink code image link lists media table',
  toolbar: [
    'undo redo | blocks | fontfamily fontsizeinput | bold italic | forecolor backcolor',
    'alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent',
    'table | link image media | code',
  ].join(' | '),
  font_family_formats: 'Arial=arial,helvetica,sans-serif; Georgia=georgia,palatino,serif; Verdana=verdana,geneva,sans-serif; Times New Roman=times new roman,times,serif; Courier New=courier new,courier,monospace',
  fontsize_formats: '8px 10px 12px 14px 16px 18px 24px 30px 36px 48px',
  // The editor runs in an iframe. Keep its content styles there instead of
  // importing them globally, otherwise TinyMCE overrides the dashboard body.
  content_style: `${contentCss}\nbody { font-family: Arial, Helvetica, sans-serif; font-size: 14px; }`,
  image_title: true,
  automatic_uploads: true,
  images_upload_handler: uploadImage,
  file_picker_types: 'image media',
  media_live_embeds: true,
  convert_urls: false,
}))
</script>
