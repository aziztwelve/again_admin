<template>
  <div class="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img class="mx-auto h-10 w-auto" :src='logo' alt="Again"/>
<!--      <h1 class="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Панель управления</h1>-->
      <h3 class="mt-6 text-center text-xl  tracking-tight text-gray-900">Войдите в свой аккаунт</h3>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
      <div class="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="email" class="block text-sm/6 font-medium text-gray-900">Адрес электронной почты</label>
            <div class="mt-2">
              <input v-model="form.email" :disabled="isLoading" type="email" name="email" id="email"
                     autocomplete="email" required=""
                     class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-red-600 sm:text-sm/6"/>
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm/6 font-medium text-gray-900">Пароль</label>
            <div class="mt-2">
              <input v-model="form.password" :disabled="isLoading" type="password" name="password" id="password"
                     autocomplete="current-password" required=""
                     class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-red-600 sm:text-sm/6"/>
            </div>
          </div>

          <div v-if="hasError">
                        <span class="text-red-600 font-semibold capitalize">
                            Произошла ошибка
                        </span>
          </div>
          <div>
            <button type="submit" :disabled="isLoading"
                    class="flex w-full justify-center rounded-md bg-red-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500">
              <span v-if="!isLoading">Войти</span>
              <span v-else>Загрузка...</span>
            </button>
          </div>

          <div class="flex items-center space-x-2">
            <Checkbox id="terms" />
            <label
                for="terms"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Запомнить меня
            </label>
          </div>

        </form>
      </div>
    </div>
  </div>

</template>

<script setup>
import {computed, reactive, ref, watch} from 'vue';
import {useStore} from 'vuex';
import {useRouter} from 'vue-router';
import { Checkbox } from '@/components/ui/checkbox'
import {assetPath} from "@/utils/assetPath";


const store = useStore()
const router = useRouter()

// const logo = 'logo.svg';
const logo = assetPath('logo.svg')


const form = reactive({
  name: '',
  password: '',
})

const signIn = (form) => store.dispatch('auth/signIn', form)

const authenticated = computed(() => store.getters['auth/authenticated'])
const hasError = computed(() => store.getters['auth/hasError'])
const isLoading = computed(() => store.getters['auth/isLoading'])

watch(authenticated, (newValue) => {
  if (newValue) {
    router.push('/dashboard')
  }
})

const handleSubmit = () => {
  signIn(form)
}

const passwordVisible = ref(false);
const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};


</script>

  