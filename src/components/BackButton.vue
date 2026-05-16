<template>
  <div class="flex space-x-2 font-medium  items-center">
    <div @click="router.back()" class="border border-gray-300 text-gray-500 cursor-pointer hover:bg-gray-200 rounded p-1">
      <ArrowLeft class="w-5 h-5" />
    </div>
    <div class="text-gray-400 text-">{{title}}</div>
  </div>

</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import {useRouter} from "vue-router";

const props = defineProps({
  title: String
})

const router = useRouter()

</script>

<style scoped>

</style>