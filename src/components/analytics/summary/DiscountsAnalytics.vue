<template>
  <Card>
    <CardHeader>
      <CardTitle>Аналитика скидок и купонов</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mb-3 flex gap-2">
        <button @click="fetch({ get_discounts: true })" class="btn">Скидки</button>
        <button @click="fetch({ get_coupons: true })" class="btn">Купоны</button>
        <button @click="fetch({ get_clients: true })" class="btn">Клиенты</button>
        <button @click="fetch({ get_categories: true })" class="btn">Категории</button>
      </div>

      <div v-if="sending" class="text-sm text-muted-foreground">Загрузка... {{ progress }}%</div>

      <div v-if="analytics.discounts">
        <h4 class="text-sm font-medium mb-2">Скидки</h4>
        <table class="w-full text-sm">
          <thead>
          <tr><th>Название</th><th>Тип</th><th>Использований</th><th>Сумма скидок</th></tr>
          </thead>
          <tbody>
          <tr v-for="d in analytics.discounts" :key="d.discount_id">
            <td>{{ d.discount_name }}</td>
            <td>{{ d.discount_type }}</td>
            <td>{{ d.usage_count }}</td>
            <td>{{ formattedNumber(d.total_discount) }} ₽</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div v-if="analytics.coupons">
        <h4 class="text-sm font-medium mt-4">Купоны</h4>
        <table class="w-full text-sm">
          <thead>
          <tr><th>Код</th><th>Использований</th><th>Сумма скидок</th><th>Сумма заказов</th></tr>
          </thead>
          <tbody>
          <tr v-for="c in analytics.coupons" :key="c.promo_code_id">
            <td>{{ c.code }}</td>
            <td>{{ c.usage_count }}</td>
            <td>{{ formattedNumber(c.total_discount) }} ₽</td>
            <td>{{ formattedNumber(c.total_order_value) }} ₽</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div v-if="Object.keys(analytics).length === 0" class="text-sm text-muted-foreground">Ничего не выбрано</div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAnalyticsFunctions } from '@/composables/useAnalyticsFunctions'

const { getDiscountsAnalytics, sending, progress } = useAnalyticsFunctions()
const analytics = reactive<any>({})

const fetch = async (params: any = {}) => {
  const res = await getDiscountsAnalytics(params)
  if (res?.data) {
    // если API оборачивает в data
    Object.assign(analytics, res.data)
  } else if (res) {
    Object.assign(analytics, res)
  }
}

const formattedNumber = (v: any) => v == null ? '—' : new Intl.NumberFormat('ru-RU').format(v)
</script>

<style scoped>
.btn { padding: 6px 10px; border-radius: 6px; background: #eef2ff; cursor: pointer }
</style>
