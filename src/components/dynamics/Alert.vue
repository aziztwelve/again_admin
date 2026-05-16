<template>
  <Alert :variant="variant">
    <Rocket v-if="title" class="h-4 w-4"/>
    <AlertTitle v-if="title">{{ title }} !</AlertTitle>
    <AlertDescription>
      {{ description }}
    </AlertDescription>
  </Alert>
</template>
<script setup lang="ts">
import {Alert, AlertDescription, AlertTitle} from '~/components/ui/alert'
import {Rocket} from 'lucide-vue-next'

const props = defineProps({
  title: String,
  description: String,
  variant: {
    default: null,
    type: String
  }
})

</script>
