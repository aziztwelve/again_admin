<template>
  <div class="space-y-6">
    <!-- Поиск и список существующих клиентов -->
    <div class="space-y-4">
      <div class="relative">
        <Search
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        />
        <input
          v-model.trim="search"
          type="text"
          placeholder="Поиск клиента (имя, телефон, email)"
          class="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
        />
      </div>

      <div class="max-h-72 overflow-y-auto rounded-md border border-gray-200">
        <div v-if="sending" class="px-4 py-6 text-sm text-gray-500">
          Поиск клиентов...
        </div>

        <div
          v-else-if="filteredClients.length"
          class="divide-y divide-gray-200"
        >
          <button
            v-for="client in filteredClients"
            :key="client.id"
            type="button"
            class="flex w-full items-start justify-between gap-4 px-4 py-3 text-left transition hover:bg-gray-50"
            @click="handleSelectExistingClient(client)"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-gray-900">
                {{ client.first_name }} {{ client.last_name }}
              </p>
              <p class="mt-1 text-xs text-gray-500">
                {{ client.phone || "Телефон не указан" }}
              </p>
            </div>

            <div class="shrink-0 text-right">
              <p class="text-sm text-gray-900">
                {{ client.email || "Email не указан" }}
              </p>
              <p class="mt-1 text-xs text-gray-500">ID: {{ client.id }}</p>
            </div>
          </button>
        </div>

        <div v-else class="px-4 py-6 text-sm text-gray-500">
          Клиенты не найдены.
        </div>
      </div>
    </div>

    <!-- Быстрое создание клиента -->
    <div class="border-t border-gray-200 pt-6">
      <h4 class="text-sm font-medium text-gray-900">
        Быстрое создание клиента
      </h4>
      <p class="mt-1 text-sm text-gray-500">
        Если нужного клиента нет в списке, создайте его здесь.
      </p>

      <form class="mt-4 space-y-4" @submit.prevent="handleCreate">
        <div>
          <label
            :for="`${idPrefix}_first_name`"
            class="block text-sm/6 font-medium text-gray-900"
            >Имя</label
          >
          <Input
            :id="`${idPrefix}_first_name`"
            v-model.trim="quickClient.first_name"
            type="text"
            placeholder="Введите имя"
          />
          <p
            v-if="quickClientErrors.first_name"
            class="mt-1 text-xs text-red-600"
          >
            {{ quickClientErrors.first_name }}
          </p>
        </div>

        <div>
          <label
            :for="`${idPrefix}_last_name`"
            class="block text-sm/6 font-medium text-gray-900"
            >Фамилия</label
          >
          <Input
            :id="`${idPrefix}_last_name`"
            v-model.trim="quickClient.last_name"
            type="text"
            placeholder="Введите фамилию"
          />
          <p
            v-if="quickClientErrors.last_name"
            class="mt-1 text-xs text-red-600"
          >
            {{ quickClientErrors.last_name }}
          </p>
        </div>

        <div>
          <label
            :for="`${idPrefix}_phone`"
            class="block text-sm/6 font-medium text-gray-900"
            >Телефон</label
          >
          <Input
            :id="`${idPrefix}_phone`"
            v-model.trim="quickClient.phone"
            type="text"
            placeholder="+7..."
          />
          <p v-if="quickClientErrors.phone" class="mt-1 text-xs text-red-600">
            {{ quickClientErrors.phone }}
          </p>
        </div>

        <div>
          <label
            :for="`${idPrefix}_email`"
            class="block text-sm/6 font-medium text-gray-900"
            >Email</label
          >
          <Input
            :id="`${idPrefix}_email`"
            v-model.trim="quickClient.email"
            type="email"
            placeholder="example@mail.com"
          />
          <p v-if="quickClientErrors.email" class="mt-1 text-xs text-red-600">
            {{ quickClientErrors.email }}
          </p>
        </div>

        <div class="space-y-2">
          <label class="flex items-center gap-2 text-sm text-gray-900">
            <Checkbox
              :id="`${idPrefix}_consent`"
              v-model="quickClient.consent_to_personal_data"
            />
            <span>Согласие на обработку персональных данных</span>
          </label>
          <p
            v-if="quickClientErrors.consent_to_personal_data"
            class="text-xs text-red-600"
          >
            {{ quickClientErrors.consent_to_personal_data }}
          </p>
        </div>

        <div class="space-y-2">
          <label class="flex items-center gap-2 text-sm text-gray-900">
            <Checkbox
              :id="`${idPrefix}_messenger`"
              v-model="quickClient.messenger_subscription"
            />
            <span>Подписка на мессенджер</span>
          </label>
        </div>

        <Button
          type="submit"
          class="w-full"
          :disabled="isQuickClientCreating"
        >
          <span v-if="!isQuickClientCreating">Добавить клиента</span>
          <span v-else>Добавление...</span>
        </Button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { Search } from "lucide-vue-next";

import Button from "@/components/ui/button/Button.vue";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuickClientCreate } from "@/composables/orders/useQuickClientCreate";
import { useClientFunctions } from "@/composables/useClientFunctions";

const props = defineProps({
  clients: {
    type: Array,
    default: () => [],
  },
  refreshClients: {
    type: Function,
    default: () => {},
  },
  idPrefix: {
    type: String,
    default: "client_picker",
  },
});

const emit = defineEmits(["select"]);

const search = ref("");
const searchResults = ref([]);
const { getClientsByParams, sending } = useClientFunctions();
let searchTimeout = null;

const clientsFromProps = computed(() => {
  if (Array.isArray(props.clients)) return props.clients;
  if (Array.isArray(props.clients?.data)) return props.clients.data;
  return [];
});

const availableClients = computed(() => {
  if (search.value.trim()) return searchResults.value;
  return clientsFromProps.value;
});

const onlyDigits = (value) => String(value ?? "").replace(/\D+/g, "");

const normalizeClient = (client) => {
  const firstName = client?.first_name ?? client?.profile?.first_name ?? "";
  const lastName = client?.last_name ?? client?.profile?.last_name ?? "";
  const fullName =
    client?.full_name ??
    client?.profile?.full_name ??
    client?.name ??
    `${firstName} ${lastName}`.trim();

  return {
    id: client?.id ?? null,
    first_name: firstName,
    last_name: lastName,
    name: client?.name ?? "",
    full_name: fullName,
    phone: client?.phone ?? client?.profile?.phone ?? client?.user?.phone ?? "",
    email: client?.email ?? "",
  };
};

const filteredClients = computed(() => {
  const rawQuery = search.value.trim();
  const query = rawQuery.toLowerCase();
  const digitsQuery = onlyDigits(rawQuery);

  return availableClients.value
    .map((client) => normalizeClient(client))
    .filter((client) => {
      if (!query) return true;
      const haystack = [
        client.first_name,
        client.last_name,
        client.name,
        client.phone,
        client.email,
        client.full_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (haystack.includes(query)) return true;
      if (digitsQuery && client.phone) {
        return onlyDigits(client.phone).includes(digitsQuery);
      }
      return false;
    });
});

const {
  quickClient,
  quickClientErrors,
  isCreating: isQuickClientCreating,
  createQuickClient,
  resetQuickClientForm,
} = useQuickClientCreate({
  clients: availableClients,
  refreshClients: () => props.refreshClients?.(),
});

const fetchClients = async (query = "") => {
  if (!query.trim()) {
    searchResults.value = [];
    return;
  }

  try {
    const response = await getClientsByParams({
      page: 1,
      per_page: 20,
      search: query,
    });
    searchResults.value = Array.isArray(response?.clients)
      ? response.clients
      : [];
  } catch {
    searchResults.value = [];
  }
};

watch(search, (value) => {
  clearTimeout(searchTimeout);
  if (!value.trim()) {
    searchResults.value = [];
    return;
  }
  searchTimeout = setTimeout(() => {
    fetchClients(value);
  }, 300);
});

const handleSelectExistingClient = (client) => {
  emit("select", normalizeClient(client));
  search.value = "";
};

const handleCreate = async () => {
  const client = await createQuickClient();
  if (!client) return;
  emit("select", normalizeClient(client));
  search.value = "";
  resetQuickClientForm();
};

const reset = () => {
  search.value = "";
  searchResults.value = [];
  resetQuickClientForm();
};

defineExpose({ reset });
</script>
