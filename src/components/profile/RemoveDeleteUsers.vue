<template>
  <dynamics-alert-dialog
    title="Важно!"
    description="Вы уверены что хотите очистить список удаленных пользователей? Действие безвозвратно!"
    button-name="Очистить список"
    button-style="bg-red-500 hover:bg-red-600"
    @continue="console.log('success')"
  />
</template>

<script setup></script>

<style scoped></style>
