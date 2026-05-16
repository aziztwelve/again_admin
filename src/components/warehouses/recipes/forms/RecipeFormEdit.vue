<template>
  <Card>
    <CardHeader>
      <BackButton title="Редактирование техкарты" @click="handleBack"/>
      <!--      <CardDescription>Заполните все необходимые поля</CardDescription>-->
    </CardHeader>
    <Loader v-if="isLoading"/>
    <CardContent v-else>
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
            :errors="errors"
            @update:model="recipeData = $event"
        />

<!--        {{recipeData}}-->
        <RecipeProductsSectionEdit
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
            {{ isSubmitting ? 'Создание...' : 'Сохранить изменения' }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {toast} from 'vue-sonner'
import axios from 'axios'
import {CreateRecipe} from '@/models/CreateRecipe'
import {useFormErrors} from '@/composables/useFormErrors'
import RecipeBasicInfo from '@/components/warehouses/recipes/forms/RecipeBasicInfo.vue'
import RecipeComponentsSection from '@/components/warehouses/recipes/forms/RecipeComponentsSection.vue'
import BackButton from '@/components/BackButton.vue'
import Loader from '@/components/common/Loader.vue'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Material} from "@/models/Material";
import {Product} from "@/models/Product";
import {Unit} from "@/models/Unit";
import RecipeProductsSectionEdit from "@/components/warehouses/recipes/edit/RecipeProductsSectionEdit.vue";
import {CreateRecipeProduct} from "@/models/CreateRecipeProduct";

const router = useRouter()
const route = useRoute()

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

const isLoading = ref(true)
const isSubmitting = ref(false)


const loadInitialData = async () => {
  try {
    isLoading.value = true
    resetErrors()

    const requests = [
      await axios.get('/products/?type=material&paginate=false'),
      await axios.get('/products?type=simple&paginate=false'),
    ]

    const [materialsRes, productsRes] = await Promise.all(requests)

    materials.value = materialsRes.data
    availableProducts.value = productsRes.data

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


    // console.log(recipeData.value)

    // Подготовка данных перед отправкой
    const formData = {
      ...recipeData.value,
      output_products: recipeData.value.output_products.map(product => {
        // Если выбран вариант, используем его ID и меняем тип
        if (product.variant_id) {
          return {
            ...product,
            component_id: product.variant_id,
            component_type: 'ProductVariant',
            qty: product.qty
          };
        } else {
          return {
            ...product,
            component_id: product.component_id,
            component_type: 'Product',
            qty: product.qty,
            is_default: product.is_default
          }
        }
        // Иначе оставляем как есть (базовый продукт)
        return product;
      })
    };

    console.log(formData)
    return
    const response = await axios.put(`/recipes/${route.params?.id}`, formData);

    toast.success('Техкарта успешно создана!');
    await router.push({name: 'recipes-list'});
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


const fetchRecipesById = async (id) => {
  isLoading.value = true
  try {
    const res = await axios.get('/recipes', {
      params: {
        recipe_id: id,
      }
    })

    if (res.data.recipes) {
      let result = new CreateRecipe(res.data.recipes)
      result.output_products = CreateRecipeProduct.groupByParent(result.output_products)
      console.log(result.output_products)
      recipeData.value = result
    }

    // console.log(recipeData.value)

  } catch (err) {
    console.error('Ошибка загрузки рецептов:', err)
    toast.error('Ошибка при получении техкарт')
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await fetchRecipesById(route.params?.id)
  await loadInitialData()
})


</script>