<template>
</template>

<script setup>
import { onMounted } from "vue";
import Cookies from "js-cookie";


onMounted(() => {
  Cookies.remove("access_token");
  window.location = '/auth'
});
</script>
