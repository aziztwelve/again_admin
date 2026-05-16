<template>
  <div
    class="-mx-4 px-4 py-8 ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-6"
  >
    <h3 class="text-sm/6 font-medium text-gray-900">Получатель</h3>
    <p class="mt-1 text-sm text-gray-500">
      Укажите ФИО и телефон того, кому передать заказ.
    </p>

    <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label
          for="recipient_first_name"
          class="block text-sm/6 font-medium text-gray-900"
        >
          Имя <span class="text-red-600">*</span>
        </label>
        <Input
          id="recipient_first_name"
          v-model.trim="recipient.first_name"
          type="text"
          placeholder="Иван"
          :class="
            errors?.first_name
              ? 'border-red-500 focus-visible:ring-red-500'
              : ''
          "
        />
        <p v-if="errors?.first_name" class="mt-1 text-sm text-red-600">
          {{
            Array.isArray(errors.first_name)
              ? errors.first_name[0]
              : errors.first_name
          }}
        </p>
      </div>

      <div>
        <label
          for="recipient_last_name"
          class="block text-sm/6 font-medium text-gray-900"
        >
          Фамилия <span class="text-red-600">*</span>
        </label>
        <Input
          id="recipient_last_name"
          v-model.trim="recipient.last_name"
          type="text"
          placeholder="Иванов"
          :class="
            errors?.last_name
              ? 'border-red-500 focus-visible:ring-red-500'
              : ''
          "
        />
        <p v-if="errors?.last_name" class="mt-1 text-sm text-red-600">
          {{
            Array.isArray(errors.last_name)
              ? errors.last_name[0]
              : errors.last_name
          }}
        </p>
      </div>

      <div>
        <label
          for="recipient_middle_name"
          class="block text-sm/6 font-medium text-gray-900"
          >Отчество</label
        >
        <Input
          id="recipient_middle_name"
          v-model.trim="recipient.middle_name"
          type="text"
          placeholder="Иванович"
        />
      </div>

      <div>
        <label
          for="recipient_phone"
          class="block text-sm/6 font-medium text-gray-900"
        >
          Телефон <span class="text-red-600">*</span>
        </label>
        <Input
          id="recipient_phone"
          v-model.trim="recipient.phone"
          type="tel"
          placeholder="+7 (___) ___-__-__"
          :class="
            errors?.phone ? 'border-red-500 focus-visible:ring-red-500' : ''
          "
        />
        <p v-if="errors?.phone" class="mt-1 text-sm text-red-600">
          {{ Array.isArray(errors.phone) ? errors.phone[0] : errors.phone }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Input } from "@/components/ui/input";

defineProps({
  errors: {
    type: Object,
    default: () => ({}),
  },
});

const recipient = defineModel("recipient", {
  type: Object,
  required: true,
});
</script>
