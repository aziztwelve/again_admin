<template>
  <div class="">
    <DynamicForm
        v-model="image"
        :submit-button-text="submitButtonName"
        :show-submit-button="props.showButton"
        :key="renderForm"
        :fields="formFields"
        @submit-form="handleUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, watch, toRaw} from 'vue'
import DynamicForm from '@/components/dynamics/DynamicForm.vue'
import HomeSlider from '@/models/HomeSlider'
import AvatarCropper from "@/components/dynamics/cropper/AvatarCropper.vue";
import {useUserProfileFunctions} from "@/composables/useUserProfileFunctions";
import {useStore} from "vuex";
import {User} from '@/models/user/User'

const props = defineProps({
  submitButtonName: {
    type: String,
    default: 'Сохранить'
  },
  showButton: {
    type: Boolean,
    default: true
  }
})
const emit = defineEmits(['updated'])

const image = ref({
  image: File,
})

const renderForm = ref(1)
const formFields = ref<any[]>([])

onMounted(() => {
  buildFormFields()
})

const buildFormFields = () => {
  formFields.value = [

    {
      name: 'image',
      component: 'text',
      type: 'file',
      placeholder: 'Изображение',
      accept: 'image/*',
      cropperAspectRatio: 1920 / 920,
      cropperAvatar: true,
    }
  ]
}


const {updateUserProfileImage} = useUserProfileFunctions()
const store = useStore()

const handleUpdate = async () => {

  if (image.value && image.value?.image instanceof File) {
    const result = await updateUserProfileImage(image.value?.image)

    store.state.auth.user = User.fromJSON(result)
    emit('updated')
  }
}

</script>
