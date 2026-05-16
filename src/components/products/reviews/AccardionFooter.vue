<template>
  <div class="flex mb-2 p-1">
    <form class="w-full flex justify-between space-x-8">
      <div class="grid items-center w-full md:space-y-2">

        <dynamics-dropdown
            label="Клиенты"
            id="customer"
            placeholder="Выбрать клиента"
            :items="customers"
            v-model="selectedCustomer"
        />

        <!-- Заявщик -->
        <dynamics-dropdown
            label="Заявщик"
            id="applicant"
            placeholder="Выбрать заявщика"
            :items="applicants"
            v-model="selectedApplicant"
        />
        <!--         deliverers -->
        <dynamics-dropdown
            label="Доставщик"
            id="applicant"
            placeholder="Выбрать доставщика"
            :items="deliverers"
            v-model="selectedDeliverer"
        />

      </div>
      <div class="w-full flex flex-col items-center justify-between md:space-y-2">

        <div class="w-full">
          <dynamics-number-field
              id="payment-term"
              v-model="paymentDuration"
              :min="0" :max="99"
              label="Срок оплаты (дны)"
          />
        </div>

        <div class="flex flex-col w-full space-y-1.5">
          <Label for="message-2">Заметка</Label>
          <Textarea v-model="description" id="message-2" class=""
                    placeholder="Введите ваше сообщение здесь."/>
        </div>

        <div class="w-full">
          <dynamics-date-picker v-model="dateTimeInvoice"/>
        </div>

      </div>
    </form>
  </div>
</template>
<script setup lang='ts'>
import {defineModel} from "vue"
import {Customer} from "~/services/customer/Customer";
import axios from "axios";
import {Cart} from "~/services/customer/Cart";
import {User} from "~/services/User";


const config = useRuntimeConfig()
const cart = defineModel<Cart>('cart', {default: () => (new Cart())});

const customers = ref<Customer[]>([]);
const applicants = ref<User[]>([]);
const deliverers = ref<User[]>([]);

onMounted(async () => {
  await getCustomers()
  await getApplicants()
  await getDeliverers()
  // console.log(cart.value)
})

async function getCustomers(curPage = 1) {
  await axios.get(`${config.public.apiUrl}/api/customer?page=${curPage}&per_page=${100}`)
      .then(res => {
        if (res.data?.data.length) {
          customers.value = res.data.data.map((item: any) => Customer.fromJSON(item) as Customer);
        }
      })
}

async function getApplicants() {
  await axios.get(`${config.public.apiUrl}/api/user/applicants`)
      .then(res => {
        if (res.data?.data.length) {
          applicants.value = res.data.data.map((item: any) => User.fromJSON(item) as User);
        }
      })
}

async function getDeliverers() {
  await axios.get(`${config.public.apiUrl}/api/user/deliverers`)
      .then(res => {
        if (res.data?.data.length) {
          deliverers.value = res.data.data.map((item: any) => User.fromJSON(item) as User);
        }
      })
}


const selectedCustomer = computed({
  get: () => cart.value.customer?.id ?? null,
  set: (val) => {
    cart.value.updateCustomer(customers.value.find(i => i.id === val) ?? null);
  }
});
const selectedApplicant = computed({
  get: () => cart.value.applicant?.id ?? null,
  set: (val) => {
    cart.value.updateApplicant(applicants.value.find(i => i.id === val) ?? null);
  }
});
const selectedDeliverer = computed({
  get: () => cart.value.deliverer?.id ?? null,
  set: (val) => {
    cart.value.updateDeliverer(deliverers.value.find(i => i.id === val) ?? null);
  }
});

const description = computed({
  get: () => cart.value.customerInvoice?.description ?? "",
  set: (val) => {
    if (cart.value && cart.value.customerInvoice) {
      cart.value.customerInvoice.description = val || null;
    }
  }
});
const paymentDuration = computed({
  get: () => cart.value.customerInvoice?.payment_due_days ?? 0,
  set: (val) => {
    if (cart.value && cart.value.customerInvoice) {
      cart.value.customerInvoice.payment_due_days = Number(val) || 0;
    }
  }
});

const dateTimeInvoice = computed({
  get: () => {
    const dateStr = cart.value.customerInvoice?.invoice_datetime;
    return dateStr ? new Date(dateStr) : null; // Преобразуем строку в Date
  },
  set: (val) => {
    if (cart.value && cart.value.customerInvoice) {
      cart.value.customerInvoice.invoice_datetime = val instanceof Date ? val.toISOString() : ""; // Преобразуем Date в строку
    }
  }
});


</script>
