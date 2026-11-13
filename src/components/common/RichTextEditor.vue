<template>
  <Editor
      v-model="content"
      :init="editorOptions"
      :disabled="disabled"
      license-key="gpl"
  />
</template>

<script setup lang="ts">
import {computed} from 'vue'
import axios from 'axios'
import {toast} from 'vue-sonner'
import Editor from '@tinymce/tinymce-vue'
import tinymce from 'tinymce/tinymce'
import 'tinymce-i18n/langs8/ru'
import 'tinymce/icons/default'
import 'tinymce/themes/silver'
import 'tinymce/models/dom'
import 'tinymce/skins/ui/oxide/skin.css'
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/code'
import 'tinymce/plugins/image'
import 'tinymce/plugins/link'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/media'
import 'tinymce/plugins/table'

// @tinymce/tinymce-vue reads the locally bundled editor from window.tinymce.
// Without this assignment it falls back to the cloud script, which requires a key.
;(window as any).tinymce = tinymce

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

const applyListToSelection = (editor: any, listTag: 'ul' | 'ol') => {
  const command = listTag === 'ul' ? 'InsertUnorderedList' : 'InsertOrderedList'
  const range = editor.selection.getRng()
  const startBlock = editor.dom.getParent(range.startContainer, editor.dom.isBlock)
  const endBlock = editor.dom.getParent(range.endContainer, editor.dom.isBlock)

  // TinyMCE correctly applies its native command to a multi-paragraph
  // selection. For text selected inside one paragraph, however, the native
  // command turns the entire paragraph into a list item. Replace only the
  // selected fragment so the text before and after it stays untouched.
  if (range.collapsed || startBlock !== endBlock) {
    editor.execCommand(command)
    return
  }

  const selectedHtml = editor.selection.getContent({format: 'html'}).trim()
  if (!selectedHtml) return

  const items = selectedHtml
    .split(/<br\s*\/?\s*>/i)
    .filter((item: string) => item.trim())
    .map((item: string) => `<li>${item}</li>`)
    .join('')

  if (!items) return

  editor.undoManager.transact(() => {
    editor.selection.setContent(`<${listTag}>${items}</${listTag}>`)
  })
}

// Внешний вид содержимого (шрифты, отступы абзацев/списков, размеры заголовков)
// должен совпадать со стилями описания на витрине: again_front/components/Product/Description.vue.
// Фирменные шрифты сайта для содержимого редактора (iframe, поэтому @font-face
// задаём здесь же). Файлы лежат в public/fonts и отдаются как /admin/fonts/.
const BRAND_FONTS_CSS = [
  ['TT Norms Pro', 400, 'TT_Norms_Pro_Regular'],
  ['TT Norms Pro', 500, 'TT_Norms_Pro_Medium'],
  ['Tenor Sans', 400, 'TenorSans-Cyrillic'],
  ['Tenor Sans', 400, 'TenorSans-LatinExt'],
  ['Tenor Sans', 400, 'TenorSans-Latin'],
].map(([family, weight, file]) => {
  const range = file === 'TenorSans-Cyrillic'
    ? ' unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;'
    : file === 'TenorSans-LatinExt'
      ? ' unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+2113, U+2C60-2C7F, U+A720-A7FF;'
      : file === 'TenorSans-Latin'
        ? ' unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;'
        : ''
  return `@font-face { font-family: "${family}"; font-weight: ${weight}; font-style: normal; src: url("/admin/fonts/${file}.woff2") format("woff2");${range} }`
}).join(' ')

const editorOptions = computed(() => ({
  height: props.height,
  language: 'ru',
  menubar: 'edit insert format table tools',
  branding: false,
  promotion: false,
  // TinyMCE 8 disables self-hosted editors until the open-source license is acknowledged.
  license_key: 'gpl',
  // UI and content CSS are bundled above. Do not let TinyMCE request absent
  // files under /admin/js/skins/ at runtime.
  skin: false,
  content_css: false,
  plugins: 'advlist autolink code image link lists media table',
  toolbar: [
    'editorundo editorredo | blocks | fontfamily fontsizeinput | bold italic | forecolor backcolor',
    'alignleft aligncenter alignright alignjustify | selectedbullist selectednumlist | outdent indent',
    'table | link image media | code',
  ].join(' | '),
  font_family_formats: 'TT Norms Pro (основной текст)=TT Norms Pro,Open Sans,sans-serif; Tenor Sans (заголовки)=Tenor Sans,sans-serif; Arial=arial,helvetica,sans-serif; Georgia=georgia,palatino,serif; Verdana=verdana,geneva,sans-serif; Times New Roman=times new roman,times,serif; Courier New=courier new,courier,monospace',
  fontsize_formats: '8px 10px 12px 14px 16px 18px 24px 30px 36px 48px',
  // The editor runs in an iframe. Its content styles must not be imported into
  // the dashboard bundle, otherwise TinyMCE overrides the dashboard body.
  content_style: BRAND_FONTS_CSS + ' body { font-family: "TT Norms Pro", "Open Sans", Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.4; margin: 1rem; } strong, b { font-weight: 800; } table { border-collapse: collapse; } th, td { padding: .4rem; border: 1px solid #ccc; } figure { margin: 1rem auto; } img, video, iframe { max-width: 100%; } p, ul, ol { margin: 0 0 14px; } ul { list-style: disc; padding-left: 20px; } ol { padding-left: 20px; } li { margin: 0 0 5px; } li:last-child { margin-bottom: 0; } h1, h2, h3, h4, h5, h6 { margin: 22px 0 8px; font-family: "Tenor Sans", sans-serif; font-weight: 400; line-height: 1.3; } h1, h2 { font-size: 24px; } h3 { font-size: 20px; } h4, h5, h6 { font-size: 18px; }',
  setup: (editor: any) => {
    editor.ui.registry.addButton('editorundo', {
      icon: 'undo',
      tooltip: 'Отменить',
      onAction: () => editor.execCommand('Undo'),
    })
    editor.ui.registry.addButton('editorredo', {
      icon: 'redo',
      tooltip: 'Повторить',
      onAction: () => editor.execCommand('Redo'),
    })
    editor.ui.registry.addButton('selectedbullist', {
      icon: 'unordered-list',
      tooltip: 'Маркированный список',
      onAction: () => applyListToSelection(editor, 'ul'),
    })
    editor.ui.registry.addButton('selectednumlist', {
      icon: 'ordered-list',
      tooltip: 'Нумерованный список',
      onAction: () => applyListToSelection(editor, 'ol'),
    })
  },
  image_title: true,
  automatic_uploads: true,
  images_upload_handler: uploadImage,
  file_picker_types: 'image media',
  media_live_embeds: true,
  convert_urls: false,
}))
</script>
