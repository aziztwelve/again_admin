<template>
  <Toaster/>
  <div>
    <BackButton title="Новый товар" class="mb-2"/>
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

                    <div class="flex md:flex-col justify-between">

                      <div class="pl-1">
                        <Label for="name">Наименование*</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            placeholder="Наименование"
                            v-model="product.name"
                        />
                      </div>

                      <MultiSelect
                          :options="colors || []"
                          v-model="product.colors"
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

      <ModalSelectColor

      />

      <div class="flex justify-end py-2">
        <Button type="submit" class="">
          Создать
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
import {useRouter} from "vue-router";
import ImageManager from "@/components/dynamics/ImageManager.vue";
import {useRandom} from "@/composables/useRandom";
import {useProductImageUploader} from "@/composables/useProductImageUploader";
import ModalWithProgressBar from "@/components/dynamics/ModalWithProgressBar.vue";
import MultiSelect from "@/components/dynamics/Dropdown/MultiSelect.vue";
import {useColorsFunctions} from "@/composables/useColorFunctions";
import {useMoySkladFunctions} from "@/composables/useMoySkladFunctions";
import ModalSelectColor from "@/components/products/create/partials/ModalSelectColor.vue";


const {getRandomInt} = useRandom()

const {getColors} = useColorsFunctions()

const colors = ref([]);

const router = useRouter()

const product = ref<Product>(Product.fromJSON({}))


const {setImagesWithProduct, sending, progress} = useProductImageUploader()
const {productsSync} = useMoySkladFunctions()

const handleCreate = async () => {

  const result = await setImagesWithProduct(product.value)

  await productsSync({})


  if (result) {
    await router.push("/products");
  }

}


onMounted(async () => {
  colors.value = await getColors();
})

</script>