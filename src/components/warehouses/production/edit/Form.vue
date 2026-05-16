<template>
  <div class="mx-auto p-6 bg-white rounded-lg shadow text-sm">
    <BackButton title="Производственное задание"/>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-5 items-end">
      <div>
        <Label>Номер задания</Label>
        <Input v-model="form.base_batch_number" disabled class="mt-1"/>
      </div>

      <div>
        <Label>Начало пр-ва</Label>
        <DatePicker
            placeholder="Выберите дату"
            v-model="form.planned_start_datetime"
            :time="true"
        />
      </div>
      <div>
        <Label>Завершение пр-ва</Label>
        <DatePicker
            placeholder="Выберите дату"
            v-model="form.planned_end_datetime"
            :time="true"
        />
      </div>
    </div>

    <div class="md:flex md:space-x-2 my-5 items-end w-full">

      <div class="w-full">
        <Label>Техкарт</Label>
        <DynamicSelect
            v-model="form.batches[0].recipe_id"
            :options="recipes"
            placeholder="Выберите техкарту"
            option-label="name"
            option-value="id"
            class="mt-1"
            disabled
        />
      </div>

      <div class="w-full">
        <Label>Статус</Label>
        <Input v-model="useStatus().getStatusConfig(form.status).text" disabled class="mt-1"/>
      </div>


      <div class="w-full">
        <Label>Исполнитель</Label>
        <DynamicSelect
            v-model="form.batches[0].performer_id"
            :options="users"
            placeholder="Выберите исполнитель"
            option-label="fullName"
            option-value="id"
            class="mt-1"
        />
      </div>

      <div class="md:min-w-[100px]">
        <Label>Объем пр-ва</Label>
        <Input
            type="number"
            v-model="form.planned_quantity"
            min="1"
            placeholder="Кол-во производства"
            class="mt-1"
        />
      </div>
    </div>

    <div class="my-4" v-if="form.batches[0].recipe">
      <DynamicsShadcnDynamicTabs
          v-model="activeTab"
          :tabs="tabs"
          class="w-full"
      >
        <template #tab-product>
          <ProductsTable
              :components="form.batches[0].output_products"
              :planned_quantity="form.planned_quantity"
              :status="form.status"
          />
        </template>

        <template #tab-material>
          <ComponentsTable
              :components="form.batches[0].material_items"
              :planned_quantity="form.planned_quantity"
          />
        </template>
        <template #tab-complete>
          <CompletedTable
              :components="form.batches[0].output_products"
              :planned_quantity="form.planned_quantity"
          />
        </template>
      </DynamicsShadcnDynamicTabs>
    </div>

    <div class="mb-8">
      <Label>Комментарий</Label>
      <Textarea
          v-model="form.notes"
          class="mt-1"
          placeholder="Дополнительные заметки"
          rows="3"
      />
    </div>

    <div class="flex justify-end gap-2">
      <Button @click="onSubmit" :disabled="isLoading">
        <span v-if="isLoading">Обновление...</span>
        <span v-else>Сохранить изменения</span>
      </Button>
      <Button variant="outline" @click="emits('complete_batch', batch?.batches)">Завершить</Button>
      <Button variant="outline" @click="router.back()">Отмена</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import axios from 'axios'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import DatePicker from "@/components/common/DatePicker.vue";
import BackButton from "@/components/BackButton.vue";
import ProductsTable from "@/components/warehouses/recipes/show/ProductsTable.vue";
import ComponentsTable from "@/components/warehouses/recipes/show//ComponentsTable.vue";
import CompletedTable from "@/components/warehouses/recipes/show/CompletedTable.vue";
import DynamicSelect from "@/components/dynamics/Dropdown/Select.vue";
import DynamicsShadcnDynamicTabs from "@/components/dynamics/shadcn/DynamicTabs.vue";
import {toast} from "vue-sonner";
import {useRouter} from "vue-router";
import {User} from "@/models/user/User";

const router = useRouter()
const props = defineProps({
  batch: {
    type: Object,
    required: true
  }
})

const emits = defineEmits(['complete_batch'])


const activeTab = ref('product')
const users = ref<any[]>([])
const recipes = ref<any[]>([])
const isLoading = ref(false)

// Инициализация формы с данными из props
const form = ref(JSON.parse(JSON.stringify(props.batch)))

// Преобразование дат для DatePicker
if (form.value.planned_start_datetime) {
  form.value.planned_start_datetime = new Date(form.value.planned_start_datetime)
}
if (form.value.planned_end_datetime) {
  form.value.planned_end_datetime = new Date(form.value.planned_end_datetime)
}

// Загрузка пользователей
const fetchUsers = async () => {
  try {
    const {data} = await axios.get('/users?only_admin_users=true')
    users.value = data.users?.data.map(i => User.fromJSON(i)) || []
  } catch (err) {
    console.error(err)
    toast.error('Не удалось загрузить список пользователей')
  }
}
const fetchRecipes = async () => {
  try {
    const data = await axios.get('/recipes')
    recipes.value = data.data.recipes || []
  } catch (err) {
    console.error(err)
    toast.error('Не удалось загрузить список пользователей')
  }
}

// Отправка формы
const onSubmit = async () => {
  isLoading.value = true

  try {
    // Подготовка данных для отправки
    const payload = {
      base_batch_number: form.value.base_batch_number,
      planned_quantity: form.value.planned_quantity,
      planned_start_date: form.value.planned_start_datetime
          ? form.value.planned_start_datetime.toISOString().slice(0, 19).replace('T', ' ')
          : null,
      planned_end_date: form.value.planned_end_datetime
          ? form.value.planned_end_datetime.toISOString().slice(0, 19).replace('T', ' ')
          : null,
      notes: form.value.notes,
      batches: form.value.batches.map(batch => ({
        id: batch.id,
        batch_number: batch.batch_number,
        recipe_id: batch.recipe_id,
        performer_id: batch.performer_id,
        planned_quantity: form.value.planned_quantity,
        planned_start_date: batch.planned_start_date
            ? new Date(batch.planned_start_date).toISOString().slice(0, 19).replace('T', ' ')
            : null,
        planned_end_date: batch.planned_end_date
            ? new Date(batch.planned_end_date).toISOString().slice(0, 19).replace('T', ' ')
            : null,
        notes: batch.notes,
        material_items: batch.material_items.map(item => ({
          component_type: item.material_type,
          component_id: item.material_id,
          quantity: item.norm_qty * form.value.planned_quantity,
          norm_qty: item.norm_qty
        })),
        output_products: batch.output_products.map(product => ({
          component_type: product.output_type,
          component_id: product.output_id,
          qty: product.norm_qty * form.value.planned_quantity,
          norm_qty: product.norm_qty
        }))
      }))
    }



    console.log(payload)
    // return


    const response = await axios.put(`/production/update-batch`, payload)

    if (response.data.success) {
      toast.success('Производственное задание успешно обновлено')
      await router.push('/warehouses/production/list')
    } else {
      toast.error(response.data.message || 'Ошибка при обновлении')
    }
  } catch (err) {
    toast.error(err.response?.data?.error || err.response?.data?.message || 'Ошибка при обновлении')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchUsers()
  await fetchRecipes()
})

const tabs = [
  {
    value: 'product',
    title: 'Продукция',
    content: 'Выходные продукты'
  },
  {
    value: 'material',
    title: 'Материалы',
    content: 'Необходимые материалы'
  },
  {
    value: 'complete',
    title: 'Выполнение',
    content: 'Статус выполнения'
  }
]
</script>