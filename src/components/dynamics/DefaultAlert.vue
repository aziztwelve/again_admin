<template>
  <div class="fixed top-[50px]">
    <Alert :variant="alert.error ? 'destructive' : 'default'">
      <AlertCircle class="w-4 h-4" v-if="alert.error" />
      <Rocket class="h-4 w-4" v-else />
      <AlertTitle v-if="alert.title">{{ alert.title }} !</AlertTitle>
      <AlertDescription>
        {{ alert.description }}
      </AlertDescription>
    </Alert>
  </div>
</template>
<script setup>
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Rocket, AlertCircle } from "lucide-vue-next";
import { toast } from "vue-sonner";

const props = defineProps({
  alert: Object,
});

onMounted(() => {
  //   setTimeout(() => {
  //     useStore().alert = null;
  //   }, 5000);
});
</script>
