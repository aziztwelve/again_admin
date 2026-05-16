<template>

  <ModalWithProgressBar
      :sending="sending"
      :target-progress="progress"
  />

  <div class="space-y-6 p-6 max-w-4xl mx-auto">
    <div>
      <h1 class="text-2xl font-bold">Настройки МойСклад</h1>
      <p class="text-muted-foreground">Управление подключением к системе учета</p>
    </div>

    <Separator/>

    <Card class="md:min-w-[600px]">
      <CardHeader>
        <div class="flex items-center space-x-3">

          <div
              class="w-10 h-10 rounded-md bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
              <path
                  d="M18.375 3.375a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h1.5a1.5 1.5 0 0 0 1.5-1.5v-13.5a1.5 1.5 0 0 0-1.5-1.5h-1.5Z"/>
              <path
                  d="M15.375 6.375a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-1.5A1.5 1.5 0 0 1 12 17.25v-10.5a1.5 1.5 0 0 1 1.5-1.5h1.5Z"/>
              <path
                  d="M4.875 9.375a3 3 0 0 1 3-3h1.5a1.5 1.5 0 0 1 1.5 1.5v10.5a1.5 1.5 0 0 1-1.5 1.5h-1.5a3 3 0 0 1-3-3v-9Z"/>
              <path
                  d="M9.375 12.375a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h1.5a1.5 1.5 0 0 0 1.5-1.5v-4.5a1.5 1.5 0 0 0-1.5-1.5h-1.5Z"/>
            </svg>
          </div>


          <div class="flex-1 flex justify-between items-center">
            <div>
              <CardTitle>Настройки МойСклад</CardTitle>
              <CardDescription>Интеграция с системой учета МойСклад</CardDescription>
            </div>
            <!--          <Switch v-model="moysklad.isActive"/>-->
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <MoySkladForm
            class=""
            submit-button-name="Синхронизировать"
            :form-data="moysklad"
            @submit-form="handleSync"

        />
      </CardContent>

    </Card>
  </div>

</template>

<script setup lang="ts">
import MoySkladForm from "@/components/integrations/moysklad/MoySkladForm.vue";
import {ref} from "vue";
import {MoyskladSettings} from "@/models/MoyskladSettings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {Separator} from "@/components/ui/separator";
import {useMoySkladFunctions} from "@/composables/useMoySkladFunctions";
import ModalWithProgressBar from "@/components/dynamics/ModalWithProgressBar.vue";

const moysklad = ref<MoyskladSettings>(MoyskladSettings.fromJSON(
    process.env.NODE_ENV === 'development'
        ? {
          password: '900737901avaz',
          email: 'testavazavaz@gmail.com'
        }
        : {
          password: '',
          email: ''
        }
))


const {progress, sending, updateMoySkladSettings} = useMoySkladFunctions()

const handleSync = async () => {
  await updateMoySkladSettings(moysklad.value.toJSONForSync())
}

</script>


<style scoped>

</style>