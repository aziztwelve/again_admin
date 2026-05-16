<template>
  <form class="grid gap-4">
    <!-- Основные поля формы -->
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-2">
        <Label for="first_name">Ваше имя <span class="text-red-500">*</span></Label>
        <Input
            id="first_name"
            v-model="user.profile.first_name"
            placeholder="Введите ваше имя"
        />
        <!--        <p v-if="errors.first_name" class="text-sm text-red-500">{{ errors.first_name }}</p>-->
      </div>
      <div class="space-y-2">
        <Label for="last_name">Ваша фамилия <span class="text-red-500">*</span></Label>
        <Input
            id="last_name"
            v-model="user.profile.last_name"
            placeholder="Введите вашу фамилию"
        />
        <!--        <p v-if="errors.last_name" class="text-sm text-red-500">{{ errors.last_name }}</p>-->
      </div>
    </div>

    <!-- Контактные данные -->
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-2">
        <Label for="email">Электронная почта <span class="text-red-500">*</span></Label>
        <Input
            id="email"
            type="email"
            v-model="user.email"
            placeholder="Введите вашу почту"
        />
        <!--        <p v-if="errors.email" class="text-sm text-red-500">{{ errors.email }}</p>-->
      </div>
      <div class="space-y-2">
        <Label for="phone">Телефон</Label>
        <Input
            id="phone"
            type="text"
            v-model="user.profile.phone"
            placeholder="Введите номер телефона"
        />
        <!--        <p v-if="errors.phone" class="text-sm text-red-500">{{ errors.phone }}</p>-->
      </div>
    </div>

    <!-- Адрес -->
    <div class="space-y-2">
      <Label for="address">Адрес проживания</Label>
      <Input
          id="address"
          v-model="user.profile.address"
          placeholder="Введите ваш адрес"
      />
      <!--      <p v-if="errors.address" class="text-sm text-red-500">{{ errors.address }}</p>-->
    </div>




    <div class="flex justify-end pt-4">
      <Button :disabled="loading" type="button" @click="emit('submit')">
        {{ loading ? 'Сохранение...' : 'Сохранить изменения' }}
      </Button>
    </div>
  </form>
</template>


<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import {toast} from 'vue-sonner'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import axios from 'axios'
import {User} from "@/models/user/User";
import {Button} from "@/components/ui/button";
import DatePicker from "@/components/dynamics/DatePicker.vue";

const props = defineProps({
  user: {
    type: Object as () => User | null,
    default: null
  }
})



const emit = defineEmits(['submit'])

const errors = ref<Record<string, string>>({})
const loading = ref(false)


</script>