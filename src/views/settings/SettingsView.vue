<template>

  <div class="flex-1">
    <router-view/>
  </div>

</template>

<script lang="ts" setup>
import {ref} from "vue";

const menuItems = ref([
  {path: '/settings/store', title: 'Настройки сайта', checked: true},
  {path: '/settings/product-params', title: 'Параметры товаров', checked: false},
  {path: '/settings/variant-props', title: 'Свойства вариантов', checked: false},
  {path: '/settings/delivery-methods', title: 'Доставка', checked: false},
  {path: '/settings/custom-statuses', title: 'Пользовательские статусы', checked: false},
  {path: '/settings/one-click-order', title: 'Заказ в один клик', checked: false},
])
</script>