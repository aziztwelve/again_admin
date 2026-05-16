<template>
  <div
    class="-mx-4 px-4 py-8 ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-6"
  >
    <h3 class="text-sm/6 font-medium text-gray-900">Данные доставки</h3>
    <p class="mt-1 text-sm text-gray-500">
      Заполните адресные данные и комментарии для доставки.
    </p>

    <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="sm:col-span-2">
        <label
          for="delivery_country"
          class="block text-sm/6 font-medium text-gray-900"
          >Страна</label
        >
        <Select
          class="mt-2"
          v-model="delivery.country"
          :options="countries"
          option-label="name"
          option-value="code"
          placeholder="Выберите страну"
          searchable
        />
      </div>

      <div class="sm:col-span-2">
        <label
          for="delivery_region"
          class="block text-sm/6 font-medium text-gray-900"
          >Регион</label
        >
        <div class="relative mt-2">
          <input
            id="delivery_region"
            :value="delivery.region"
            type="text"
            placeholder="Начните вводить регион"
            :disabled="!delivery.country"
            autocomplete="off"
            class="block h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 max-md:text-base"
            @input="handleRegionNativeInput"
            @focus="isRegionFocused = true"
            @blur="handleRegionBlur"
          />

          <div
            v-if="showRegionDropdown"
            class="absolute z-20 mt-2 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
          >
            <div v-if="isRegionLoading" class="px-3 py-2 text-sm text-gray-500">
              Поиск регионов...
            </div>

            <div
              v-else-if="regionSuggestions.length"
              class="max-h-60 overflow-y-auto py-1"
            >
              <button
                v-for="region in regionSuggestions"
                :key="region.id"
                type="button"
                class="block w-full px-3 py-2 text-left text-sm text-gray-900 transition hover:bg-gray-50"
                @mousedown.prevent="selectRegion(region)"
              >
                {{ region.name }}
              </button>
            </div>

            <div v-else class="px-3 py-2 text-sm text-gray-500">
              Ничего не найдено.
            </div>
          </div>
        </div>
      </div>

      <div class="sm:col-span-2">
        <label
          for="delivery_city"
          class="block text-sm/6 font-medium text-gray-900"
        >
          Город <span class="text-red-600">*</span>
        </label>
        <div class="relative mt-2">
          <input
            id="delivery_city"
            :value="delivery.city"
            type="text"
            placeholder="Начните вводить город"
            :disabled="!delivery.country"
            autocomplete="off"
            :class="[
              'block h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 max-md:text-base',
              errors?.city
                ? 'border-red-500 focus-visible:ring-red-500'
                : 'border-input focus-visible:ring-ring',
            ]"
            @input="handleCityNativeInput"
            @focus="isCityFocused = true"
            @blur="handleCityBlur"
          />

          <div
            v-if="showCityDropdown"
            class="absolute z-20 mt-2 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
          >
            <div v-if="isCityLoading" class="px-3 py-2 text-sm text-gray-500">
              Поиск городов...
            </div>

            <div
              v-else-if="citySuggestions.length"
              class="max-h-60 overflow-y-auto py-1"
            >
              <button
                v-for="city in citySuggestions"
                :key="city.id"
                type="button"
                class="block w-full px-3 py-2 text-left text-sm text-gray-900 transition hover:bg-gray-50"
                @mousedown.prevent="selectCity(city)"
              >
                {{ city.name }}
              </button>
            </div>

            <div v-else class="px-3 py-2 text-sm text-gray-500">
              Ничего не найдено.
            </div>
          </div>
        </div>
        <p v-if="errors?.city" class="mt-1 text-sm text-red-600">
          {{ errors.city[0] }}
        </p>
      </div>

      <div>
        <label
          for="delivery_postal_code"
          class="block text-sm/6 font-medium text-gray-900"
          >Почтовый индекс</label
        >
        <Input
          id="delivery_postal_code"
          v-model.trim="delivery.postal_code"
          type="text"
          placeholder="101000"
        />
      </div>

      <div class="sm:col-span-2">
        <label
          for="delivery_address"
          class="block text-sm/6 font-medium text-gray-900"
          >Адрес <span class="text-red-600">*</span></label
        >
        <Input
          id="delivery_address"
          v-model.trim="delivery.address"
          type="text"
          placeholder="Улица, дом, квартира"
          :class="
            errors?.address ? 'border-red-500 focus-visible:ring-red-500' : ''
          "
        />
        <p v-if="errors?.address" class="mt-1 text-sm text-red-600">
          {{ errors.address[0] }}
        </p>
      </div>

      <div class="sm:col-span-2">
        <label
          for="delivery_entrance"
          class="block text-sm/6 font-medium text-gray-900"
          >Подъезд</label
        >
        <Input
          id="delivery_entrance"
          v-model.trim="delivery.entrance"
          type="text"
          placeholder="2"
        />
      </div>

      <div>
        <label
          for="delivery_floor"
          class="block text-sm/6 font-medium text-gray-900"
          >Этаж</label
        >
        <Input
          id="delivery_floor"
          v-model.trim="delivery.floor"
          type="text"
          placeholder="5"
        />
      </div>

      <div>
        <label
          for="delivery_intercom"
          class="block text-sm/6 font-medium text-gray-900"
          >Домофон</label
        >
        <Input
          id="delivery_intercom"
          v-model.trim="delivery.intercom"
          type="text"
          placeholder="123В"
        />
      </div>

      <div class="sm:col-span-2">
        <label
          for="delivery_comment"
          class="block text-sm/6 font-medium text-gray-900"
          >Комментарий к доставке</label
        >
        <textarea
          id="delivery_comment"
          v-model.trim="delivery.delivery_comment"
          rows="3"
          class="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          placeholder="Как пройти, где оставить, важные детали"
        />
      </div>

      <div class="sm:col-span-2">
        <label
          for="delivery_date"
          class="block text-sm/6 font-medium text-gray-900"
          >Дата и время доставки</label
        >
        <Input
          id="delivery_date"
          v-model="delivery.delivery_date"
          type="datetime-local"
          class="mt-2"
        />
      </div>

      <div class="sm:col-span-2">
        <label
          for="buyer_comment"
          class="block text-sm/6 font-medium text-gray-900"
          >Комментарий покупателя</label
        >
        <textarea
          id="buyer_comment"
          v-model.trim="delivery.buyer_comment"
          rows="3"
          class="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          placeholder="Комментарий клиента к заказу"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { Input } from "@/components/ui/input";
import Select from "@/components/dynamics/Dropdown/Select.vue";

const countries = ref([]);
const regionSuggestions = ref([]);
const isRegionLoading = ref(false);
const isRegionFocused = ref(false);
const selectedRegionId = ref(null);
const citySuggestions = ref([]);
const isCityLoading = ref(false);
const isCityFocused = ref(false);
const selectedCityId = ref(null);
let regionSearchTimeout = null;
let citySearchTimeout = null;

const props = defineProps({
  errors: {
    type: Object,
    default: () => ({}),
  },
});

const delivery = defineModel("deliveryAddress", {
  type: Object,
  required: true,
});

const normalizeCountries = (payload) => {
  if (payload == null) return [];

  let items = [];
  if (Array.isArray(payload)) {
    items = payload;
  } else if (Array.isArray(payload.countries)) {
    items = payload.countries;
  } else if (Array.isArray(payload.data)) {
    items = payload.data;
  } else if (Array.isArray(payload.data?.countries)) {
    items = payload.data.countries;
  } else if (Array.isArray(payload.data?.data)) {
    items = payload.data.data;
  }

  return items
    .map((item) => ({
      id: item?.id ?? null,
      code: String(item?.code ?? item?.value ?? item?.iso2 ?? item?.id ?? ""),
      name: String(
        item?.name ?? item?.label ?? item?.title ?? item?.code ?? "",
      ),
    }))
    .filter((item) => item.code && item.name);
};

const normalizeComparableValue = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const normalizeRegionSuggestions = (payload) => {
  const items = Array.isArray(payload?.regions)
    ? payload.regions
    : Array.isArray(payload?.data?.regions)
      ? payload.data.regions
      : [];

  return items
    .map((item) => ({
      id: item?.id ?? null,
      name: String(item?.name ?? ""),
      country_id: item?.country_id ?? null,
    }))
    .filter((item) => item.id && item.name);
};

const normalizeCitySuggestions = (payload) => {
  const items = Array.isArray(payload?.cities)
    ? payload.cities
    : Array.isArray(payload?.data?.cities)
      ? payload.data.cities
      : [];

  return items
    .map((item) => ({
      id: item?.id ?? null,
      name: String(item?.name ?? ""),
      region_id: item?.region_id ?? null,
      country_id: item?.country_id ?? null,
    }))
    .filter((item) => item.id && item.name);
};

const resolveOptionValue = (value, options) => {
  if (!value) return value;

  const raw = normalizeComparableValue(value);
  const matched = (options || []).find((option) => {
    const code = normalizeComparableValue(option?.code);
    const name = normalizeComparableValue(option?.name);
    const baseName = normalizeComparableValue(
      String(option?.name || "").split(" (")[0],
    );
    return raw === code || raw === name || raw === baseName;
  });

  return matched?.code ?? value;
};

const selectedCountryId = computed(() => {
  const raw = normalizeComparableValue(delivery.value?.country);
  const matched = (countries.value || []).find((country) => {
    const id = normalizeComparableValue(country?.id);
    const code = normalizeComparableValue(country?.code);
    const name = normalizeComparableValue(country?.name);
    return raw === id || raw === code || raw === name;
  });

  if (matched?.id) {
    return matched.id;
  }

  const numericCountryId = Number(delivery.value?.country);
  return Number.isFinite(numericCountryId) && numericCountryId > 0
    ? numericCountryId
    : null;
});

const showRegionDropdown = computed(() => {
  return (
    isRegionFocused.value &&
    (isRegionLoading.value ||
      regionSuggestions.value.length > 0 ||
      Boolean(delivery.value?.region?.trim()))
  );
});

const showCityDropdown = computed(() => {
  return (
    isCityFocused.value &&
    (isCityLoading.value ||
      citySuggestions.value.length > 0 ||
      Boolean(delivery.value?.city?.trim()))
  );
});

const fetchCountries = async () => {
  try {
    const { data } = await axios.get("/countries");
    countries.value = normalizeCountries(data);
    if (delivery.value?.country) {
      delivery.value.country = resolveOptionValue(
        delivery.value.country,
        countries.value,
      );
    }
    // Устанавливаем Россию по умолчанию, если страна не выбрана
    if (!delivery.value?.country) {
      const ru = countries.value.find(
        (c) =>
          (c.code || "").toUpperCase() === "RU" ||
          /россия|russia/i.test(c.name || ""),
      );
      if (ru?.code) {
        delivery.value.country = ru.code;
      }
    }
  } catch {
    countries.value = [];
  }
};

const fetchRegionSuggestions = async (query = "") => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    regionSuggestions.value = [];
    return;
  }

  isRegionLoading.value = true;

  try {
    const { data } = await axios.get("/regions/search", {
      params: {
        query: normalizedQuery,
        ...(selectedCountryId.value
          ? { country_id: selectedCountryId.value }
          : {}),
        limit: 10,
      },
    });

    regionSuggestions.value = normalizeRegionSuggestions(data);

    const matchedRegion = regionSuggestions.value.find(
      (region) =>
        normalizeComparableValue(region.name) ===
        normalizeComparableValue(delivery.value?.region),
    );
    selectedRegionId.value = matchedRegion?.id ?? null;
  } catch {
    regionSuggestions.value = [];
  } finally {
    isRegionLoading.value = false;
  }
};

const fetchCitySuggestions = async (query = "") => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    citySuggestions.value = [];
    return;
  }

  isCityLoading.value = true;

  try {
    const { data } = await axios.get("/cities/search", {
      params: {
        query: normalizedQuery,
        ...(selectedCountryId.value
          ? { country_id: selectedCountryId.value }
          : {}),
        ...(selectedRegionId.value
          ? { region_id: selectedRegionId.value }
          : {}),
        limit: 10,
      },
    });

    citySuggestions.value = normalizeCitySuggestions(data);

    const matchedCity = citySuggestions.value.find(
      (city) =>
        normalizeComparableValue(city.name) ===
        normalizeComparableValue(delivery.value?.city),
    );
    selectedCityId.value = matchedCity?.id ?? null;
  } catch {
    citySuggestions.value = [];
  } finally {
    isCityLoading.value = false;
  }
};

const selectRegion = (region) => {
  delivery.value.region = region.name;
  selectedRegionId.value = region.id;
  regionSuggestions.value = [];
  isRegionFocused.value = false;
};

const selectCity = (city) => {
  delivery.value.city = city.name;
  selectedCityId.value = city.id;
  citySuggestions.value = [];
  isCityFocused.value = false;
};

const handleRegionBlur = () => {
  window.setTimeout(() => {
    isRegionFocused.value = false;
  }, 120);
};

const handleCityBlur = () => {
  window.setTimeout(() => {
    isCityFocused.value = false;
  }, 120);
};

const queueRegionSearch = (value) => {
  const normalizedValue = String(value ?? "").trim();

  if (!normalizedValue) {
    regionSuggestions.value = [];
    selectedRegionId.value = null;
    return;
  }

  if (regionSearchTimeout) {
    clearTimeout(regionSearchTimeout);
  }

  regionSearchTimeout = window.setTimeout(() => {
    fetchRegionSuggestions(normalizedValue);
  }, 300);
};

const queueCitySearch = (value) => {
  const normalizedValue = String(value ?? "").trim();

  if (!normalizedValue) {
    citySuggestions.value = [];
    selectedCityId.value = null;
    return;
  }

  if (citySearchTimeout) {
    clearTimeout(citySearchTimeout);
  }

  citySearchTimeout = window.setTimeout(() => {
    fetchCitySuggestions(normalizedValue);
  }, 300);
};

const handleRegionNativeInput = (event) => {
  delivery.value.region = String(event?.target?.value ?? "").trim();
  queueRegionSearch(event?.target?.value ?? "");
};

const handleCityNativeInput = (event) => {
  delivery.value.city = String(event?.target?.value ?? "").trim();
  queueCitySearch(event?.target?.value ?? "");
};

onMounted(async () => {
  await fetchCountries();
});

onBeforeUnmount(() => {
  if (regionSearchTimeout) {
    clearTimeout(regionSearchTimeout);
  }
  if (citySearchTimeout) {
    clearTimeout(citySearchTimeout);
  }
});

watch(
  () => delivery.value.country,
  async (newValue, oldValue) => {
    if (newValue !== oldValue) {
      delivery.value.region = "";
      delivery.value.city = "";
      selectedRegionId.value = null;
      selectedCityId.value = null;
      regionSuggestions.value = [];
      citySuggestions.value = [];
    }
  },
);

watch(
  () => delivery.value.region,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      delivery.value.city = "";
      selectedCityId.value = null;
      citySuggestions.value = [];
    }

    const matchedRegion = regionSuggestions.value.find(
      (region) =>
        normalizeComparableValue(region.name) ===
        normalizeComparableValue(newValue),
    );
    selectedRegionId.value = matchedRegion?.id ?? null;
  },
);

watch(
  () => delivery.value.city,
  (newValue) => {
    const matchedCity = citySuggestions.value.find(
      (city) =>
        normalizeComparableValue(city.name) ===
        normalizeComparableValue(newValue),
    );
    selectedCityId.value = matchedCity?.id ?? null;
  },
);
</script>
