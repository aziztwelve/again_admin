<template>
  <div class="flex h-full">
    <!-- Sidebar -->
    <div class="w-64 border-r bg-card p-4">
      <div class="space-y-4">
        <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Настройки магазина
        </h2>
        <nav class="space-y-1">
          <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              v-slot="{ isActive }"
              class="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              :class="[
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            ]"
          >
            <span>{{ item.title }}</span>
          </router-link>
        </nav>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex-1 overflow-auto p-6">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component"/>
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

interface MenuItem {
  path: string
  title: string
  icon?: string
}

const menuItems = ref<MenuItem[]>([
  {path: '/settings/home-slider', title: 'Слайдер на главной'},
  {path: '/settings/oto', title: 'OTO Баннеры'},
])
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>