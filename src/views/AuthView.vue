<template>
    <SignIn />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import SignIn from '@/components/auth/SignIn.vue'

onMounted(() => {
  document.documentElement.classList.add('bg-gray-100');
});

onUnmounted(() => {
  document.documentElement.classList.remove('bg-gray-100');
});
</script>