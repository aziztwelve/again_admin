<template>
  <div class="space-y-4">
    <div v-if="client?.profile?.full_name" class="flex items-center gap-2">
      <User class="w-4 h-4 text-muted-foreground"/>
      <span class="text-sm">{{ client.profile?.full_name }}</span>
    </div>

    <div v-if="client?.profile?.phone" class="flex items-center gap-2">
      <Phone class="w-4 h-4 text-muted-foreground"/>
      <span class="text-sm">{{ client.profile?.phone }}</span>
    </div>

    <div v-if="client?.email" class="flex items-center gap-2">
      <Mail class="w-4 h-4 text-muted-foreground"/>
      <span class="text-sm">{{ client.email }}</span>
    </div>

    <div v-if="client?.profile?.address" class="flex items-start gap-2">
      <MapPin class="w-4 h-4 text-muted-foreground mt-0.5"/>
      <span class="text-sm">{{ client.profile?.address }}</span>
    </div>

    <div v-if="client?.profile?.birthday" class="flex items-center gap-2">
      <Cake class="w-4 h-4 text-muted-foreground"/>
      <span class="text-sm">{{ useDateFormat().formatDateToRussian(client.profile?.birthday )}}</span>
    </div>

  </div>
</template>

<script setup lang="ts">
import {Mail, Phone, User, MapPin, Cake} from "lucide-vue-next";
import {Client} from "@/types/client";
import {useDateFormat} from "@/composables/useDateFormat";

interface Props {
  client: Client;
}

defineProps<Props>();
</script>

<style scoped>

</style>