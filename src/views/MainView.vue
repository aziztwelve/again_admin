<template>
    <Sidebar />
    <main class="pt-2 lg:pl-72 ">
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
            <RouterView></RouterView>
        </div>
    </main>
</template>
<script setup>
import Sidebar from '@/components/containers/Sidebar.vue';
</script>
