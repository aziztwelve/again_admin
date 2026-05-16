<template>
  <Toaster/>
  <Loader v-if="isLoading"/>
  <div v-else>
    <BackButton :title="product.name ??  'товар'" class="mb-2"/>
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
                    <UploadImages :product="product"/>
                  </div>

                  <div class="grid w-full items-center gap-2 p-2">
                    <Label for="name">Наименование*</Label>
                    <Input
                        id="name"
                        type="text"
                        required
                        placeholder="Наименование"
                        v-model="product.name"
                    />
                  </div>
                  <div class="grid w-full items-center gap-2 p-2">
                    <Label for="description">Описание</Label>
                    <Textarea
                        class="min-h-[100px]"
                        id="description"
                        type="text"
                        placeholder="Укажите главные особенности, характеристики и ключевые слова, чтобы сгенерировать более качественное описание."
                        v-model="product.description"
                    />
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
            <ProductVariant/>
          </div>
        </div>
      </div>

      <Button
          type="submit"
          class="bg-blue-400 hover:bg-blue-500 active:bg-blue-400 mt-2">
        Сохранить
      </Button>

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
import UploadImages from "@/components/products/update/partials/UploadImages.vue";
import PriceStock from "@/components/products/update/partials/PriceStock.vue";
import SkuSize from "@/components/products/update/partials/SkuSize.vue";
import ProductVariant from "@/components/products/update/partials/ProductVariant.vue";
import PositionSelect from "@/components/products/update/partials/PositionSelect.vue";
import {Product} from "@/models/Product";
import Button from "@/components/ui/button/Button.vue";
import {toast} from 'vue-sonner'
import axios from "axios";
import {useRouter} from "vue-router";
import {useRoute} from "vue-router";
import Loader from "@/components/common/Loader.vue";

const isLoading = ref<boolean>(true)
const router = useRouter()
const route = useRoute()
const product = ref<Product>(new Product())


onMounted(async () => {
  await getProduct(route.params.id)
})

async function getProduct(id: any) {
  await axios.get(`products/${id}`)
      .then(res => {
        for (let key in res.data) {
          product.value[key] = res.data[key]
        }
      })
      .finally(async () => {
        isLoading.value = false
      })
}

const handleCreate = async () => {
  if (!product.value.name) {
    toast('Ошибка!', {
      description: 'Пожалуйста, укажите наименование товара.',
      action: {
        label: 'Отмена',
      },
    })
    return
  }
  if (!product.value.price) {
    toast('Ошибка!', {
      description: 'Пожалуйста, укажите цена товара.',
      action: {
        label: 'Отмена',
      },
    })
    return
  }

  await updateProduct(route.params.id)

}

async function updateProduct(id: any) {

  const p = product.value

  const formData: Record<string, number> = {};

  for (const key in p) {
    if (typeof p[key] === "boolean") {
      formData[key] = p[key] ? 1 : 0;
    } else {
      formData[key] = p[key]
    }
  }

  await axios.put(`products/${id}`, product.value)
      .then(res => {
        if (res.status === 200) {
          if (product.value.imageFiles.length > 0) {
            saveImages()
            return
          }
        }
        toast("Успех!", {
          description: "Товар успешно обновлен.",
          action: {
            label: "Ок",
          },
        });
        router.push("/products");
      })
      .catch(err => {
        toast("Ошибка!", {
          description: `${err.message}`,
          action: {
            label: "Отмена",
          },
        });
      });
}


async function saveImages() {
  const formData = new FormData();

  product.value.imageFiles.forEach((file, index) => {
    formData.append(`images[]`, file, file.name); // Добавляем файлы
  });

  await axios.post(`/products/${product.value.id}/images`, formData)
      .then(res => {
        toast("Успех!", {
          description: "Товар успешно обновлен.",
          action: {
            label: "Ок",
          },
        });
        router.push("/products");
      })
      .catch(err => {
        toast("Ошибка!",{
          description: `${err.message}`,
          action: {
            label: "error"
          }
        })
      })
}


</script>