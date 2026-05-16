<template>
  <Card>
    <CardHeader>
      <BackButton title="Создание новой техкарты" @click="handleBack"/>
      <!--      <CardDescription>Заполните все необходимые поля</CardDescription>-->
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <RecipeBasicInfo
            v-model="recipeData"
            :units="units"
            :is-units-loading="isLoading"
            :errors="errors"
        />

        <RecipeComponentsSection
            :model="recipeData"
            :units="units"
            :materials="materials"
            :products="availableProducts"
            :is-units-loading="isLoading"
            :errors="errors"
            @update:model="recipeData = $event"
        />

        <RecipeProductsSection
            v-model="recipeData"
            :available-products="availableProducts"
            :is-loading="isLoading"
            :errors="errors"
        />


        <div class="flex justify-end gap-2 pt-4">
          <Button
              type="submit"
              :disabled="isSubmitting || isLoading"
          >
            <Loader v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin"/>
            {{ isSubmitting ? 'Создание...' : 'Создать техкарту' }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {toast} from 'vue-sonner'
import axios from 'axios'
import {CreateRecipe} from '@/models/CreateRecipe'
import {useFormErrors} from '@/composables/useFormErrors'

import RecipeBasicInfo from '@/components/warehouses/recipes/forms/RecipeBasicInfo.vue'
import RecipeComponentsSection from '@/components/warehouses/recipes/forms/RecipeComponentsSection.vue'
import RecipeProductsSection from '@/components/warehouses/recipes/forms/RecipeProductsSection.vue'
import BackButton from '@/components/BackButton.vue'
import Loader from '@/components/common/Loader.vue'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader} from "@/components/ui/card";
import {Material} from "@/models/Material";
import {Product} from "@/models/Product";
import {Unit} from "@/models/Unit";

const router = useRouter()

const {errors, setErrors, resetErrors} = useFormErrors()

// State
const recipeData = ref<CreateRecipe>(new CreateRecipe({
  name: '',
  description: '',
  output_unit_id: null,
  instructions: '',
  production_time: 0,
  is_active: true,
  material_items: [],
  output_products: [],
}))

const units = ref<Unit[]>([])
const materials = ref<Material[]>([])
const availableProducts = ref<Product[]>([])

const isLoading = ref(false)
const isSubmitting = ref(false)


const loadInitialData = async () => {
  try {
    isLoading.value = true
    resetErrors()

    const requests = [
      await axios.get('/units'),
      await axios.get('/products/?type=material&paginate=false'),
      await axios.get('/products?type=simple&paginate=false'),
    ]

    const [unitsRes, materialsRes, productsRes] = await Promise.all(requests)

    units.value = unitsRes.data
    materials.value = materialsRes.data
    availableProducts.value = productsRes.data

    // Set default unit if available
    if (units.value.length > 0) {
      recipeData.value.output_unit_id = units.value[0].id
    }
  } catch (error) {
    console.error('Failed to load initial data:', error)
    toast.error('Не удалось загрузить необходимые данные')
  } finally {
    isLoading.value = false
  }
}


const handleSubmit = async () => {
  try {
    isSubmitting.value = true;
    resetErrors();

    // Подготовка данных перед отправкой
    const formData = {
      ...recipeData.value,
      output_products: recipeData.value.output_products.flatMap(product => {
        if (product.variant_id) {
          return [
            {
              component_type: 'ProductVariant',
              component_id: product.variant_id,
              qty: product.qty,
              is_default: product.is_default
            },
            {
              component_type: 'Product',
              component_id: product.component_id,
              qty: product.qty,
              is_default: product.is_default

            }
          ];
        }

        return [
          {
            component_type: 'Product',
            component_id: product.component_id,
            qty: product.qty,
            is_default: product.is_default

          }
        ];
      })
    };

    console.log(formData)
    // return

    const response = await axios.post('/recipes', formData);

    toast.success('Техкарта успешно создана!');
    await router.push({ name: 'recipes-list' });
  } catch (error: any) {
    console.error('Ошибка при создании техкарты:', error);

    if (error.response?.status === 422) {
      setErrors(error.response.data.errors);
      toast.error(error.response.data.message || 'Пожалуйста, исправьте ошибки в форме');
    } else {
      toast.error(error.response?.data?.message || 'Ошибка при создании техкарты');
    }
  } finally {
    isSubmitting.value = false;
  }
};


const handleBack = () => {
  router.push({name: 'recipes-list'})
}

// Lifecycle
onMounted(() => {
  loadInitialData()
})
</script>