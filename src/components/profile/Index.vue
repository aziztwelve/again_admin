<template>
  <BackButton title="Профиль пользователя"/>
  <div v-if="user" class=" mx-auto animate-fade-in font-sans mt-2">

    <!-- Карточка профиля -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <!-- Обложка и основная информация -->
      <div class="md:flex">
        <!-- Обложка и аватар (мобильная версия) -->
        <!-- Мобильная шапка -->
        <div class="md:hidden h-40 bg-gradient-to-r from-red-500 to-red-700 relative">
          <div class="absolute -bottom-16 left-6">
            <div class="relative inline-block">
              <Avatar class="h-40 w-40 mb-4 border-4 border-white shadow-lg">
                <AvatarImage :src="user.profile?.image" alt="@unovue"/>
                <AvatarFallback class="bg-gradient-to-r from-red-400 to-red-600 text-white text-4xl font-medium">
                  {{ initials }}
                </AvatarFallback>
              </Avatar>


              <EditAvatarModal>
                <template #content>
                  <button
                      class="absolute bottom-6 right-3 bg-white text-red-500 p-2 rounded-full shadow-md hover:bg-red-100 transition"
                      title="Редактировать аватарку"
                  >
                    <Pencil class="w-5 h-5"/>
                  </button>
                </template>
              </EditAvatarModal>

            </div>

          </div>
        </div>

        <!-- Колонка с аватаром (десктоп) -->
        <div class="hidden md:flex flex-col items-center p-6 bg-red-500 text-white border-r border-red-700 w-64">


          <div class="relative inline-block">
            <Avatar class="h-40 w-40 mb-4 border-4 border-white shadow-lg">
              <AvatarImage :src="user.profile?.image" alt="@unovue"/>
              <AvatarFallback class="bg-gradient-to-r from-red-400 to-red-600 text-white text-4xl font-medium">
                {{ initials }}
              </AvatarFallback>
            </Avatar>

            <!-- Кнопка-карандаш поверх аватарки -->


            <EditAvatarModal>
              <template #content>
                <button
                    class="absolute bottom-6 right-3 bg-white text-red-500 p-2 rounded-full shadow-md hover:bg-red-100 transition"
                    title="Редактировать аватарку"
                >
                  <Pencil class="w-5 h-5"/>
                </button>
              </template>
            </EditAvatarModal>

          </div>


          <h1 class="text-xl font-bold text-center text-white">{{ user.fullName }}</h1>
          <Badge v-if="user.email_verified_at" variant="success" class="mt-2">
            <BadgeCheck class="h-4 w-4 mr-1"/>
            Подтверждён
          </Badge>
        </div>


        <!-- Контент профиля -->
        <div class="flex-1 p-6 bg-gray-100">
          <!-- Шапка (десктоп) -->
          <div class="hidden md:flex justify-between items-start mb-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-800">{{ user.fullName }}</h1>
              <p class="text-gray-600 flex items-center gap-1.5 mt-1">
                <Mail class="h-4 w-4"/>
                {{ user.email }}
              </p>
            </div>
            <div class="flex gap-2">
              <ProfileEdit
                  v-if="user"
                  :user="user"
                  @updated="handlingUpdate($event)"
              />
            </div>
          </div>

          <!-- Мобильная шапка -->
          <div class="md:hidden mb-6 pt-8">
            <div class="flex justify-between items-start">
              <div>
                <h1 class="text-xl font-bold text-gray-800">{{ user.fullName }}</h1>
                <p class="text-gray-600 flex items-center gap-1.5 mt-1">
                  <Mail class="h-4 w-4"/>
                  {{ user.email }}
                </p>
              </div>
            </div>
          </div>

          <!-- Детали профиля -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label class="text-gray-600">Имя</Label>
              <p class="font-medium text-gray-800">{{ user.profile?.first_name || 'Не указано' }}</p>
            </div>
            <div>
              <Label class="text-gray-600">Фамилия</Label>
              <p class="font-medium text-gray-800">{{ user.profile?.last_name || 'Не указана' }}</p>
            </div>
            <div>
              <Label class="text-gray-600">Телефон</Label>
              <p class="font-medium text-gray-800">{{ user.profile?.phone || 'Не указан' }}</p>
            </div>
            <div>
              <Label class="text-gray-600">Адрес</Label>
              <p class="font-medium text-gray-800">{{ user.profile?.address || 'Не указан' }}</p>
            </div>
            <div>
              <Label class="text-gray-600">Дата регистрации</Label>
              <p class="font-medium text-gray-800">{{ registrationDate }}</p>
            </div>
            <div>
              <Label class="text-gray-600">Роль</Label>
              <p class="font-medium text-gray-800">{{ userRole }}</p>
            </div>
          </div>

          <!-- Кнопки действий (мобильные) -->

          <div class="md:hidden flex gap-3 mt-6">
            <ProfileEdit
                v-if="user"
                :user="user"
                @updated="handlingUpdate($event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="flex items-center justify-center h-64 font-sans">
    <Loader2 class="h-8 w-8 text-blue-500 animate-spin"/>
  </div>

</template>

<script setup lang="ts">
import {computed} from 'vue'
import {Mail, Pencil, Loader2, BadgeCheck} from 'lucide-vue-next'
import {Badge} from '@/components/ui/badge'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Label} from '@/components/ui/label'
import {useStore} from 'vuex'
import {User} from '@/models/user/User'
import BackButton from "@/components/BackButton.vue";
import ProfileEdit from "@/components/profile/Edit/Index.vue"
import EditAvatarModal from "@/components/profile/Edit/EditAvatarModal.vue";

const store = useStore()

const user = computed(() => {
  const userData = store.state.auth.user
  return userData ? User.fromJSON(userData) : null
})



const initials = computed(() => {
  if (!user.value?.profile) return 'П'
  const first = user.value.profile.first_name?.charAt(0) || ''
  const last = user.value.profile.last_name?.charAt(0) || ''
  return `${first}${last}`.toUpperCase()
})

const userRole = computed(() => {
  return user.value?.roles?.[0]?.name || 'Роль не назначена'
})

const registrationDate = computed(() => {
  if (!user.value?.created_at) return 'Недавно'

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Moscow'
  }
  return new Date(user.value.created_at).toLocaleDateString('ru-RU', options)
})

function handlingUpdate(updatedUser: User) {

  store.commit('auth/set_user', updatedUser)
}

</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

/* Плавные переходы для кнопок */
button {
  transition: all 0.2s ease;
}

/* Улучшенная читаемость текста */
.text-gray-800 {
  color: #1f2937;
}

.text-gray-600 {
  color: #4b5563;
}
</style>