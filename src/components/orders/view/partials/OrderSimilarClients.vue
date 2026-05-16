<template>
  <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
    <h3 class="text-sm font-semibold text-gray-900">Похожие клиенты</h3>

    <p
      v-if="!clients.length"
      class="mt-2 text-sm text-gray-500"
    >
      Совпадений по телефону, e-mail или ФИО не найдено
    </p>

    <div v-else class="mt-4 overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-muted/50 text-left">
          <tr>
            <th class="w-10 px-3 py-2 font-medium"></th>
            <th class="px-3 py-2 font-medium">Клиент</th>
            <th class="px-3 py-2 font-medium">Телефон</th>
            <th class="px-3 py-2 font-medium">E-mail</th>
            <th class="px-3 py-2 font-medium">Совпадение</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(c, i) in clients"
            :key="c.id"
            class="border-t"
          >
            <td class="px-3 py-2 text-gray-400">{{ i + 1 }}</td>
            <td class="px-3 py-2 whitespace-nowrap">
              <RouterLink
                :to="`/clients/${c.id}`"
                class="font-medium text-blue-600 hover:underline"
              >
                {{ c.full_name || `Клиент #${c.id}` }}
              </RouterLink>
            </td>
            <td class="px-3 py-2 whitespace-nowrap">
              {{ c.phone || "—" }}
            </td>
            <td class="px-3 py-2 whitespace-nowrap">
              {{ c.email || "—" }}
            </td>
            <td class="px-3 py-2">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="m in c.matched_by || []"
                  :key="m"
                  class="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium"
                  :class="badgeClass(m)"
                >
                  {{ matchLabel(m) }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from "vue-router";

defineProps({
  clients: { type: Array, default: () => [] },
});

const matchLabel = (m) => {
  switch (m) {
    case "phone":
      return "Телефон";
    case "email":
      return "E-mail";
    case "name":
      return "ФИО";
    default:
      return m;
  }
};

const badgeClass = (m) => {
  switch (m) {
    case "phone":
      return "bg-emerald-100 text-emerald-800";
    case "email":
      return "bg-blue-100 text-blue-800";
    case "name":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
};
</script>
