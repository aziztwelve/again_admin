<template>

  <Loader v-if="loading"/>

  <div v-else>
    <BackButton :title="product.name" class="mb-2"/>
    <form @submit.prevent="handleCreate" class="">

      <div class="grid ">

        <div class="space-y-3">

          <div class="border p-2 rounded-lg ">
            <PositionSelect :product="product"/>
          </div>


          <!--        о таваре-->
          <div class="border p-2 rounded-lg">
            <Accordion type="single" collapsible default-value="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <span class="pl-1 text-md text-sm">О товаре</span>
                </AccordionTrigger>
                <AccordionContent>

                  <div class="p-2">
                    <ImageManager
                        v-model="product.images"
                        :show-button-save="false"
                        :horizontal="true"
                    />
                  </div>

                  <div class="grid md:grid-cols-2 w-full gap-2">

                    <div class="flex flex-col max-md:space-y-2 justify-between">

                      <div class="">
                        <Label for="name">Наименование*</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            placeholder="Наименование"
                            v-model="product.name"
                        />
                      </div>


                      <Select
                          v-model="product.color_id"
                          :options="colors || []"
                          option-label="name"
                          placeholder="Выберите цвет товара"
                          disabled
                      />
                    </div>


                    <div class="">
                      <Label for="description">Описание</Label>
                      <Textarea
                          class="min-h-[100px]"
                          id="description"
                          type="text"
                          placeholder="Укажите главные особенности, характеристики и ключевые слова, чтобы сгенерировать более качественное описание."
                          v-model="product.description"
                      />
                    </div>

                  </div>

                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>


          <div class="border border-gray-300 rounded-lg p-2">
            <ProductEditMarketplaceLinks :product="product"/>
          </div>

          <!--        Цены и остатки-->
          <div class="border border-gray-300 rounded-lg p-2">
            <PriceStock :product="product"/>
          </div>

          <!--        Артикул и габариты-->
          <div class="border p-2 rounded-lg font-medium">
            <SkuSize :product="product"/>
          </div>



          <div class="border p-2 rounded-lg font-medium">
            <ProductVariant :product="product"/>
          </div>
        </div>
      </div>

      <ModalWithProgressBar
          :sending="sending"
          :target-progress="progress"
          @closeModal="sending = false"
      />

      <div class="flex justify-end py-2">
        <Button type="submit" class="">
          Сохранить
        </Button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import BackButton from "@/components/BackButton.vue";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import PriceStock from "@/components/products/create/partials/PriceStock.vue";
import SkuSize from "@/components/products/create/partials/SkuSize.vue";
import ProductVariant from "@/components/products/create/partials/ProductVariant.vue";
import PositionSelect from "@/components/products/create/partials/PositionSelect.vue";
import {Product} from "@/models/Product";
import Button from "@/components/ui/button/Button.vue";
import {useRouter, useRoute} from "vue-router";
import ImageManager from "@/components/dynamics/ImageManager.vue";
import {useProductImageUploader} from "@/composables/useProductImageUploader";
import ModalWithProgressBar from "@/components/dynamics/ModalWithProgressBar.vue";
import MultiSelect from "@/components/dynamics/Dropdown/MultiSelect.vue";
import Select from "@/components/dynamics/Dropdown/Select.vue";
import {useColorsFunctions} from "@/composables/useColorFunctions";
import {useProductFunctions} from "@/composables/useProductFunctions";
import {useMoySkladFunctions} from "@/composables/useMoySkladFunctions";
import ProductEditMarketplaceLinks from "@/components/products/edit/ProductEditMarketplaceLinks.vue";


const colors = ref([]);

const loading = ref(true)

const router = useRouter()
const route = useRoute()

const product = ref<Product>(Product.fromJSON({}))

const {getProductsById} = useProductFunctions()
const {updateImagesWithProduct, sending, progress} = useProductImageUploader()
const {productsSync} = useMoySkladFunctions()


const handleCreate = async () => {

  const result = await updateImagesWithProduct(product.value)

  // await productsSync({})

  if (result) {
    await router.push("/products");
  }

}

onMounted(async () => {
  await getProductsById(route.params.id, {
    admin: true
  })
      .then(res => {
        product.value = Product.fromJSON(res)
        console.log(product.value)
      })
      .finally(() => loading.value = false)
  // colors.value = await getColors();
  // console.log(colors.value)
})

</script>