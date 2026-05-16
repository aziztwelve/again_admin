<template>
  <Card class="shadow-none bottom-0 rounded-md">
    <CardHeader class="border-b p-2 bg-gray-100">
      <CardTitle class="flex items-center justify-between text-sm">
        <span>Детали заказа</span>
<!--        <Badge variant="outline" class="text-xs py-0.5">-->
<!--          {{ new Date().toLocaleDateString() }}-->
<!--        </Badge>-->
      </CardTitle>
    </CardHeader>

    <CardContent class="p-4">
      <!-- Товары -->
      <div class="mb-6">
        <h3 class="text-sm font-medium mb-2 flex items-center">
          <Package class="w-3 h-3 mr-1" />
          Товары
        </h3>

        <div class="border rounded-md overflow-hidden">
          <Table>
            <TableHeader class="bg-muted/30">
              <TableRow class="h-8">
                <TableHead class="w-[30px] text-xs p-1">№</TableHead>
                <TableHead class="text-xs p-1">Артикул</TableHead>
                <TableHead class="text-xs p-1 ">Наименование</TableHead>
                <TableHead class="text-right text-xs p-1 ">Цена</TableHead>
                <TableHead class="text-right text-xs p-1 ">Вес</TableHead>
                <TableHead class="text-right text-xs p-1 whitespace-nowrap">Кол-во</TableHead>
                <TableHead class="text-right text-xs p-1">Сумма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(item, index) in order?.items" :key="index" class="h-8 hover:bg-muted/10">
                <TableCell class="p-1">{{index + 1}}</TableCell>
                <TableCell class="p-1 whitespace-nowrap">
                  <Badge variant="outline" class="text-xs whitespace-nowrap">{{item.variant?.name}}</Badge>
                </TableCell>
                <TableCell class="p-1 text-xs whitespace-nowrap">{{item.product?.name}} ({{item.variant?.name}})</TableCell>
                <TableCell class="p-1 text-right text-xs whitespace-nowrap">{{item.variant?.price}} ₽</TableCell>
                <TableCell class="p-1 text-right text-xs whitespace-nowrap">0.5 кг</TableCell>
                <TableCell class="p-1 text-right text-xs whitespace-nowrap">{{item?.quantity}} шт</TableCell>
                <TableCell class="p-1 text-right text-xs font-medium whitespace-nowrap">{{item?.price}} ₽</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
      <!-- Доставка -->
      <div class="mb-6">
        <h3 class="text-sm font-medium mb-2 flex items-center">
          <Truck class="w-3 h-3 mr-1" />
          Доставка
        </h3>

        <div class="border rounded-md p-3 text-xs">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <div class="text-muted-foreground">Служба:</div>
              <div>{{ order.delivery_method?.name }}</div>
              <div class="text-muted-foreground mt-1">Тариф:</div>
              <div>{{ order.delivery_method?.description }}</div>
            </div>

            <div>
              <div class="text-muted-foreground">Пункт выдачи:</div>
              <div>{{ order?.delivery_target }}</div>
              <div class="text-muted-foreground mt-1">Дата доставки:</div>
              <div>{{ formatDateToRussian(order?.delivery_date, true) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Итоги -->
      <div class="border rounded-md p-3 text-xs">
        <h3 class="text-sm font-medium mb-2">Итоги</h3>

        <div class="space-y-1">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Товары:</span>
            <span>{{ formatCurrency(order.total_amount) }}</span>
          </div>

          <div class="flex justify-between">
            <span class="text-muted-foreground">Доставка:</span>
            <span>{{ order.delivery_method.type ? formatCurrency(order.delivery_method.type) : 'Бесплатно' }}</span>
          </div>

          <template v-if="order.discount_amount && parseFloat(order.discount_amount) > 0">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Скидка:</span>
              <span class="text-green-600">-{{ formatCurrency(order.discount_amount) }}</span>
            </div>
          </template>

          <div class="border-t my-1"></div>

          <div class="flex justify-between font-medium">
            <span>Итого:</span>
            <span>{{ formatCurrency(calculateTotal(order)) }}</span>
          </div>

          <div class="flex justify-between text-primary mt-1">
            <span>Статус оплаты:</span>
            <span class="font-medium">
        {{ order.is_paid ? 'Оплачено' : 'Ожидает оплаты' }}
        <span v-if="!order.is_paid" class="text-muted-foreground text-xs ml-1">
          ({{ order.payment_status }})
        </span>
      </span>
          </div>

          <div v-if="order.items_count > 0" class="flex justify-between text-muted-foreground mt-1">
            <span>Кол-во товаров:</span>
            <span>{{ order.items_count }} шт</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Package, Truck } from 'lucide-vue-next'
// Card components
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'

// ReviewsTable components
import Table from '@/components/ui/table/Table.vue'
import TableBody from '@/components/ui/table/TableBody.vue'
import TableCell from '@/components/ui/table/TableCell.vue'
import TableHead from '@/components/ui/table/TableHead.vue'
import TableHeader from '@/components/ui/table/TableHeader.vue'
import TableRow from '@/components/ui/table/TableRow.vue'
import { useDateFormat } from '@/composables/useDateFormat'
// Other components
import Badge from '@/components/ui/badge/Badge.vue'
import type Order from "@/models/order/Order";
import {onMounted} from "vue";

const { formatDateToRussian } = useDateFormat()

const order = defineModel('order') as unknown as Order;

const formatCurrency = (value: string | number) => {
  const amount = typeof value === 'string'
      ? parseFloat(value.replace(/[^\d.]/g, ''))
      : value
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2
  }).format(amount)
}

// Функция для расчета итоговой суммы
const calculateTotal = (order: Order) => {
  const total = parseFloat(order.total_amount.replace(/[^\d.]/g, ''))
  const discount = parseFloat(order.discount_amount.replace(/[^\d.]/g, ''))
  return (total - discount).toFixed(2)
}

onMounted(() => {
  console.log(order.value)

})

</script>