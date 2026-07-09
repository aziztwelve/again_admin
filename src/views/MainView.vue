<template>
    <Sidebar />
    <main class="admin-main-content pt-2">
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
            <RouterView></RouterView>
        </div>
    </main>
</template>
<script setup>
import Sidebar from '@/components/containers/Sidebar.vue';
</script>

<style>
@media (min-width: 1024px) {
    .admin-main-content {
        padding-left: var(--admin-sidebar-width, 18rem);
        transition: padding-left 200ms ease;
    }
}
</style>
