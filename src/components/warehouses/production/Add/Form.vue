<template>
  <div class="mx-auto p-6 bg-white rounded-lg shadow text-sm">

    <BackButton title="Создать производственное задание"/>

    <!--    <h1 class="text-2xl font-bold mb-6">Производственное задание №</h1>-->

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-5 items-end">
      <div>
        <Label>Организация</Label>
        <div class="flex items-center gap-2 mt-1">
          <Input v-model="form.organization" disabled/>
<!--          <Button variant="outline">Выбрать</Button>-->
        </div>
      </div>

      <div>
        <Label>Начало произ-ва</Label>
        <DatePicker placeholder="Выберите дату" v-model="form.planned_start_date"/>
      </div>
      <div>
        <Label>Завершение произ-ва</Label>
        <DatePicker placeholder="Выберите дату" v-model="form.planned_end_datetime"/>
      </div>
    </div>

    <div class="md:flex md:space-x-2 max-md:space-y-2">
      <DynamicSelect
          v-model="form.batches.recipe_id"
          :options="techCarts"
          placeholder="Выберите техкарту"
          option-label="name"
          option-value="id"
      />

      <div>
        <Input type="number"
               v-model="form.quantity"
               min="1" placeholder="Кол-во производства"
        />
      </div>

      <div class="md:min-w-[100px] w-full">
        <DynamicSelect
            class=""
            v-model="form.batches.performer_id"
            :options="users"
            placeholder="Выберите исполнитель"
            option-label="fullName"
            option-value="id"
        />
      </div>

    </div>

    <div class="my-4" v-if="selectedTechCart">

      <DynamicsShadcnDynamicTabs
          :key="renderRecipe"
          v-model="activeTab"
          :tabs="tabs"
          class="w-full"
      >
        <template #tab-product>
          <ProductsTable
              :components="form.batches.output_products"
              :planned_quantity="form.quantity"
          />
        </template>

        <template #tab-material>
          <ComponentsTable
              :components="form.batches?.material_items"
              :planned_quantity="form.quantity"
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


    <div class="flex justify-end gap-4">
      <!--      <Button variant="outline">Отмена</Button>-->
      <Button @click="onSubmit" :disabled="isLoading">
        <span v-if="isLoading">Создание...</span>
        <span v-else>Создать задание</span>
      </Button>
    </div>

  </div>
</template>


<script setup lang="ts">
import {ref, onMounted, computed, watch} from 'vue'
import axios from 'axios'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import DatePicker from "@/components/common/DatePicker.vue";
import BackButton from "@/components/BackButton.vue";
import ProductsTable from "@/components/warehouses/recipes/show/ProductsTable.vue";
import ComponentsTable from "@/components/warehouses/recipes/show//ComponentsTable.vue";import DynamicSelect from "@/components/dynamics/Dropdown/Select.vue";
import DynamicsShadcnDynamicTabs from "@/components/dynamics/shadcn/DynamicTabs.vue";
import {User} from "@/models/user/User";
import {toast} from "vue-sonner";
import {useRouter} from "vue-router";


const router = useRouter()

const renderComp = ref(1)
const renderRecipe = ref(1)
const activeTab = ref('')
const selectedTechCart = ref<any>(null)
// Данные для формы
const techCarts = ref<any[]>([])
const users = ref<any[]>([])
const isLoading = ref(false)


// Состояния формы
const form = ref({
  techCartId: '',
  quantity: 1,
  planned_start_date: new Date().toISOString().split('T')[0],
  planned_end_datetime: new Date().toISOString().split('T')[0],
  notes: '',
  organization: 'Again',

  batches: {
    id: '',
    recipe_id: null,
    planned_qty: null,
    performer_id: null,
    output_products: [],
    material_items: [],
  },
})

watch(() => selectedTechCart.value?.output_products, (newProducts) => {
  form.value.batches.output_products = newProducts ? [...newProducts] : []
  // console.log(form.value.batches, 'tuck tec')
  renderRecipe.value++
}, {deep: true})
watch(() => selectedTechCart.value?.material_items, (newProducts) => {
  form.value.batches.material_items = newProducts ? [...newProducts] : []
  // renderRecipe.value++
}, {deep: true})



// Загрузка техкарт
const fetchTechCarts = async () => {
  try {
    const {data} = await axios.get('/recipes')
    techCarts.value = data?.recipes
  } catch (err) {
    console.error(err)
  }
}
const fetchUsers = async () => {
  try {
    const {data} = await axios.get('/users?only_admin_users=true')
    users.value = data.users?.data.map(i => User.fromJSON(i))
    // console.log(users.value)
  } catch (err) {
    console.error(err)
  }
}

const onSubmit = async () => {
  isLoading.value = true

  console.log(prepareDataFormBatches(form.value.batches))
  // return
  await axios.post('/production/create-batch', {
    // quantity: form.value.quantity,
    planned_start_date: form.value.planned_start_date,
    planned_end_date: form.value.planned_end_datetime,
    notes: form.value.notes,
    batches: prepareDataFormBatches(form.value.batches)
  })
      .then((res) => {
          router.push('/warehouses/production/list')
          toast.success(res.data.message)
      })
      .catch(err => {
        toast.error(err.response.data.error || err.response.data.message || 'Что то пащло не так')
      })
      .finally(() => {
        isLoading.value = false
      })
}

function prepareDataFormBatches(batches) {
  return [
    {
      id: batches.id || "",
      batch_number: null,
      recipe_id: batches.recipe_id,
      planned_quantity: form.value.quantity || null,
      performer_id: batches.performer_id,
      material_items: batches.material_items.map(item => ({
        component_type: item.component_type,
        component_id: item.component_id,
        quantity: item.quantity * form.value.quantity
      })),
      output_products: batches.output_products.map(product => ({
        component_type: product.component_type,
        component_id: product.component_id,
        qty:  Math.trunc(product.qty) * form.value.quantity
      }))
    }
  ]
}


onMounted(async () => {
  await fetchTechCarts()
  await fetchUsers()
})


watch(() => form.value.batches.recipe_id, (techCartId) => {
  if (!techCartId) return
  selectedTechCart.value = techCarts.value.find(i => (i.id == techCartId))
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
    content: 'Password content here'
  }
]


</script>