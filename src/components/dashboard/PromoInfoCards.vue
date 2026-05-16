<template>
  <div class="space-y-4">
<!--    <h2 class="text-2xl font-semibold tracking-tight">Акции и информация</h2>-->

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

      <!-- Контакты -->
      <Card class="hover:shadow-lg transition-shadow bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <CardHeader>
<!--          <CardTitle class="text-xl text-white">Ваш сайт</CardTitle>-->
          <CardTitle class="text-xl text-white">AGAIN</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-gray-300">Официальный сайт:</p>
          <a href="https://again8.ru" target="_blank" class="text-lg font-medium hover:underline flex items-center mt-2">
            again8.ru
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
</script>