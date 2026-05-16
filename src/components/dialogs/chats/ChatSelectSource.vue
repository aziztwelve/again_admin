<template>
  <div>
    <DynamicForm
        v-model="props.currentSource"
        :fields="formFields"
    />
  </div>
</template>

<script setup lang="ts">
import DynamicForm from "@/components/dynamics/DynamicForm.vue";
import {ref} from "vue";
import {FormDynamicFieldType} from "@/types/form";
import {MessageCircle, Smartphone, Send, MessageSquare, Mail, Zap} from 'lucide-vue-next';
import {ChatSourceObj} from "@/types/conversation";


const emit = defineEmits(['changeSource']);

interface Props {
  currentSource: ChatSourceObj;
}

const props = defineProps<Props>()


const formFields = ref<FormDynamicFieldType[]>([
  {
    name: 'source',
    component: 'select',
    label: '',
    required: false,
    placeholder: 'Выберите..',
    options: [
      {title: 'Все диалоги', value: 'all',},
      {title: 'Онлайн чат', value: 'web_chat', icon: MessageCircle, styleIcon: 'text-green-700'},
      {title: 'Vk', value: 'vk', icon: MessageSquare, styleIcon: 'text-blue-800'},
      {title: 'WhatsApp', value: 'whatsapp', icon: Smartphone, styleIcon: 'text-green-500'},
      {title: 'Telegram', value: 'telegram', icon: Send, styleIcon: 'text-blue-400'},
      {title: 'Max', value: 'max', icon: Zap, styleIcon: 'text-purple-500'},
      {title: 'Почта', value: 'email', icon: Mail, styleIcon: 'text-orange-400'},
    ],
    optionLabel: 'title',
    optionValue: 'value'
  },
])


</script>

<style scoped>

</style>