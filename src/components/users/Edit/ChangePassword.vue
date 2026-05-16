<template>
  <form class="grid gap-3" v-show="changePass" @submit.prevent="updatePassword">
    <!-- Поле для ввода текущего пароля -->
    <Input type="password" placeholder="Старый пароль" v-model="item.old_password" />

    <!-- Поле для ввода нового пароля -->
    <Input type="password" placeholder="Новый пароль" v-model="item.password" />

    <!-- Поле для подтверждения нового пароля -->
    <Input type="password" placeholder="Подтвердить пароль" v-model="item.confirm_password" />

  </form>
</template>

<script setup>
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"



const props = defineProps({
  changePass: Boolean,
  item: Object,
});
</script>

<style scoped></style>
