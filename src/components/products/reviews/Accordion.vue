<template>
  <Accordion type="single" collapsible>
    <AccordionItem value="item-1">
      <div class="flex justify-between">

        <div class="flex space-x-2 items-center">
          <div>
            <AccordionTrigger class="text-gray-600 font-medium"/>
          </div>
          <div class="text-gray-600">
            <span class="text-gray-900 font-medium">Клиент:</span>
            {{ cart?.customer?.name ?? 'Не выбрано' }}
          </div>
        </div>

        <div class="flex flex-col text-gray-600 py-2">
          <div>
            <span class="text-gray-900 font-medium">Кол-во:</span> {{ cart?.qty() ?? 0 }}
          </div>
          <div>
            <span class="text-gray-900 font-medium">Итого:</span> {{ cart?.total() ?? 0 }}
          </div>
        </div>
      </div>

      <AccordionContent>
        <CustomerAccardionFooter
            v-if="cart"
            :cart="cart"
        />
        <DynamicsAlertDialog
            button-name="Сохранить"
            :title="`Выбранный клиент: ${cart?.customer?.name || 'Не указан'}`"
            description="Вы уверены, что хотите завершить продажу?"
            @continue="submitProductItems"
        />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>

<script setup lang="ts">
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion'
import {Cart} from "~/services/customer/Cart";
import type {Customer} from "~/services/customer/Customer";
import axios from "axios";
import {toast} from 'vue-sonner'
import {useTabsStore} from "~/stores/useTabsStore";


const emit = defineEmits(['updated'])
const props = defineProps({
  apiParams: Object
})

const tabStore = useTabsStore()
const cart = defineModel<Cart | null>('cart', {default: () => (new Cart())});
const config = useRuntimeConfig()

async function submitProductItems() {
  const productItems = cart.value?.productItems;
  const customer: Customer | null = cart.value?.customer ?? null;
  if (!productItems) return;

  const prepareDataForm = productItems.map(item => ({
    product_id: item.product?.id ?? null,
    retail_price: item.price ?? null,
    price: item.supply_price ?? null,
    qty: item.qty ?? 0,
    total: item.total() ?? 0,
  }));

  if (!props.apiParams) return


  // console.log(cart.value)
  // return

  await axios.request({
    method: props.apiParams.method as 'post' | 'put' | 'patch',
    url: `${config.public.apiUrl}/api/${props.apiParams.url}`,
    data: {
      id: cart.value?.customerInvoice?.id ?? null,
      customer_id: customer?.id ?? null,
      applicant_id: cart.value?.applicant?.id ?? null,
      applicant: cart.value?.applicant?.name ?? null,
      total: cart.value?.total(),
      qty: cart.value?.qty(),
      description: cart.value?.customerInvoice?.description ?? null,
      invoice_datetime: cart.value?.customerInvoice?.invoice_datetime,
      payment_due_days: cart.value?.customerInvoice?.payment_due_days,
      details: prepareDataForm,
    },
    params: props.apiParams.params,
  }).then(res => {
    if (res.data.status) {
      // const successMessage = props.apiParams?.method === 'patch'
      //     ? 'Накладная успешно обновлена!'
      //     : 'Накладная успешно создана!';

      toast('Данные были успешно сохранены.');
      changeTab('customer-invoice')
      cart.value?.clearCart()
      emit('updated', true)
    }
  }).catch(() => {
    const errorMessage = props.apiParams?.method === 'patch'
        ? 'Не удалось обновить. Попробуйте снова.'
        : 'Не удалось создать. Попробуйте снова.';
    toast('Ошибка', {
      description: errorMessage,
    });
  });
}

const changeTab = (value: string | number) => {
  tabStore.setCurrentTab(value);
};


</script>
