<template>
  <Dialog :open="open" @update:open="(value: boolean) => !value && emit('close')">
    <DialogScrollContent class="max-w-4xl">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
      </DialogHeader>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div class="mt-2 flex flex-col gap-3 md:flex-row">
        <div class="flex flex-col gap-2 md:w-80">
          <input
              v-model.trim="search"
              type="search"
              placeholder="Поиск по названию или адресу"
              class="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <div class="max-h-[55vh] overflow-y-auto rounded-md border border-input">
            <p v-if="loading" class="p-3 text-sm text-muted-foreground">Загружаем пункты…</p>
            <p v-else-if="!filteredPoints.length && !error" class="p-3 text-sm text-muted-foreground">Пункты не найдены</p>
            <button
                v-for="point in filteredPoints"
                :key="point.key"
                type="button"
                class="block w-full border-b border-input px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted"
                :class="point.key === selectedKey ? 'bg-muted font-medium' : ''"
                @click="selectPoint(point)"
            >
              <span class="block">{{ point.name }}</span>
              <span class="block text-xs text-muted-foreground">{{ point.address }}</span>
            </button>
          </div>
        </div>

        <div ref="mapEl" class="h-[55vh] w-full rounded-md border border-input bg-muted/30 md:flex-1"></div>
      </div>

      <DialogFooter class="mt-4">
        <Button type="button" variant="outline" @click="emit('close')">Отмена</Button>
        <Button type="button" :disabled="!selectedPoint" @click="confirm">Выбрать пункт</Button>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>
</template>

<script setup lang="ts">
import {computed, nextTick, ref, watch} from "vue";
import axios from "axios";
import {Dialog, DialogFooter, DialogHeader, DialogScrollContent, DialogTitle} from "@/components/ui/dialog";
import Button from "@/components/ui/button/Button.vue";

/**
 * Выбор пункта выдачи на карте (СДЭК или Яндекс.Доставка).
 *
 * Города в админке ищутся по своей базе и не содержат ни кода СДЭК, ни geo_id
 * Яндекса, поэтому здесь город определяется по названию:
 *  - СДЭК: публичный поиск городов СДЭК → код города → точки ПВЗ/постаматов;
 *  - Яндекс: геокодер Яндекс.Карт → координаты → точки в радиусе 120 км.
 * Точки берём из тех же публичных эндпоинтов, что и витрина.
 */

const props = defineProps<{
  open: boolean;
  provider: "cdek" | "yandex";
  cityName: string;
  /** Для СДЭК: PVZ — пункт выдачи, POSTAMAT — постамат. */
  cdekPointType?: "PVZ" | "POSTAMAT";
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "select", point: PickedPoint): void;
}>();

interface PickedPoint {
  provider: "cdek" | "yandex";
  code: string;
  name: string;
  address: string;
  /** [longitude, latitude] — порядок, который принимает API заказа. */
  coordinates: [number, number];
  pointType: string;
}

interface MapPoint extends PickedPoint {
  key: string;
  lat: number;
  lon: number;
}

const YANDEX_MAPS_URL = "https://api-maps.yandex.ru/2.1/";
const YANDEX_RADIUS_KM = 120;

const mapEl = ref<HTMLElement | null>(null);
const points = ref<MapPoint[]>([]);
const loading = ref(false);
const error = ref("");
const search = ref("");
const selectedKey = ref<string | null>(null);

let ymaps: any = null;
let map: any = null;
let clusterer: any = null;

const title = computed(() =>
    props.provider === "cdek"
        ? (props.cdekPointType === "POSTAMAT" ? "Постаматы СДЭК" : "Пункты выдачи СДЭК")
        : "Пункты самовывоза Яндекс.Доставки",
);

const filteredPoints = computed(() => {
  const query = search.value.toLowerCase();
  if (!query) return points.value;
  return points.value.filter((point) =>
      `${point.name} ${point.address}`.toLowerCase().includes(query),
  );
});

const selectedPoint = computed(() => points.value.find((point) => point.key === selectedKey.value) ?? null);

/** Загружает Яндекс.Карты один раз и резолвится готовым ymaps. */
const loadYandexMaps = (): Promise<any> => {
  const w = window as any;
  if (w.ymaps && typeof w.ymaps.ready === "function") {
    return new Promise((resolve) => w.ymaps.ready(() => resolve(w.ymaps)));
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src^="${YANDEX_MAPS_URL}"]`);
    const onLoad = () => (window as any).ymaps.ready(() => resolve((window as any).ymaps));
    if (existing) {
      existing.addEventListener("load", onLoad, {once: true});
      return;
    }
    const key = process.env.VUE_APP_YANDEX_MAPS_API_KEY as string | undefined;
    const script = document.createElement("script");
    script.src = `${YANDEX_MAPS_URL}?lang=ru_RU${key ? `&apikey=${encodeURIComponent(key)}` : ""}`;
    script.async = true;
    script.onload = onLoad;
    script.onerror = () => reject(new Error("Не удалось загрузить Яндекс.Карты"));
    document.head.appendChild(script);
  });
};

const normalizeCdek = (raw: any, type: string): MapPoint | null => {
  const lat = Number(raw?.location?.latitude);
  const lon = Number(raw?.location?.longitude);
  const code = String(raw?.code ?? "");
  if (!code || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const address = raw?.location?.address ?? raw?.location?.address_full ?? "";
  return {
    key: `cdek:${code}`,
    provider: "cdek",
    code,
    name: raw?.name || code,
    address,
    coordinates: [lon, lat],
    pointType: type,
    lat,
    lon,
  };
};

const normalizeYandex = (raw: any): MapPoint | null => {
  const lat = Number(raw?.position?.latitude);
  const lon = Number(raw?.position?.longitude);
  const code = String(raw?.id ?? "");
  if (!code || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const address = typeof raw?.address === "string" ? raw.address : (raw?.address?.full_address ?? "");
  return {
    key: `yandex:${code}`,
    provider: "yandex",
    code,
    name: raw?.name || address || code,
    address,
    coordinates: [lon, lat],
    pointType: "PICKUP",
    lat,
    lon,
  };
};

const loadCdekPoints = async (): Promise<{ center: [number, number] | null }> => {
  const {data: citiesData} = await axios.get("/public/delivery/cdek/cities", {
    params: {query: props.cityName, country_code: "RU"},
  });
  const cities = citiesData?.cities ?? citiesData?.data?.cities ?? [];
  const city = cities.find((item: any) => String(item?.name ?? "").toLowerCase() === props.cityName.toLowerCase()) ?? cities[0];
  if (!city?.code) throw new Error(`Город «${props.cityName}» не найден в СДЭК`);

  const type = props.cdekPointType ?? "PVZ";
  const {data} = await axios.get("/public/delivery/cdek/pvz", {params: {city_code: city.code, type}});
  const list = (data?.points ?? []).map((raw: any) => normalizeCdek(raw, type)).filter(Boolean) as MapPoint[];
  points.value = list;
  return {center: list.length ? [list[0].lat, list[0].lon] : null};
};

const loadYandexPoints = async (): Promise<{ center: [number, number] | null }> => {
  ymaps = await loadYandexMaps();
  const geo = await ymaps.geocode(props.cityName, {results: 1});
  const first = geo.geoObjects.get(0);
  if (!first) throw new Error(`Город «${props.cityName}» не найден на карте`);
  const [lat, lon] = first.geometry.getCoordinates();

  const latDelta = YANDEX_RADIUS_KM / 111;
  const lonDelta = YANDEX_RADIUS_KM / Math.max(111 * Math.cos((lat * Math.PI) / 180), 1);
  const {data} = await axios.get("/public/delivery/yandex/pvz", {
    params: {
      latitude_from: lat - latDelta,
      latitude_to: lat + latDelta,
      longitude_from: lon - lonDelta,
      longitude_to: lon + lonDelta,
    },
  });
  points.value = (data?.points ?? []).map(normalizeYandex).filter(Boolean) as MapPoint[];
  return {center: [lat, lon]};
};

const renderMap = (center: [number, number] | null) => {
  if (!mapEl.value || !ymaps) return;
  if (!map) {
    map = new ymaps.Map(mapEl.value, {center: center ?? [55.751574, 37.573856], zoom: 11, controls: ["zoomControl"]});
    clusterer = new ymaps.Clusterer({preset: "islands#invertedBlueClusterIcons", groupByCoordinates: false});
    map.geoObjects.add(clusterer);
  } else if (center) {
    map.setCenter(center, 11, {duration: 0});
  }
  clusterer.removeAll();
  points.value.forEach((point) => {
    const mark = new ymaps.Placemark([point.lat, point.lon], {hintContent: point.name, balloonContent: point.address}, {preset: "islands#blueDotIcon"});
    mark.events.add("click", () => selectPoint(point));
    clusterer.add(mark);
  });
};

const selectPoint = (point: MapPoint) => {
  selectedKey.value = point.key;
  if (map) map.setCenter([point.lat, point.lon], 15, {duration: 300});
};

const confirm = () => {
  const point = selectedPoint.value;
  if (!point) return;
  emit("select", {
    provider: point.provider,
    code: point.code,
    name: point.name,
    address: point.address,
    coordinates: point.coordinates,
    pointType: point.pointType,
  });
  emit("close");
};

const load = async () => {
  points.value = [];
  selectedKey.value = null;
  search.value = "";
  error.value = "";
  loading.value = true;
  try {
    if (!props.cityName) throw new Error("Укажите город доставки в форме");
    const result = props.provider === "cdek" ? await loadCdekPoints() : await loadYandexPoints();
    await nextTick();
    if (!ymaps) ymaps = await loadYandexMaps();
    renderMap(result.center);
    if (!points.value.length) error.value = "В этом городе нет пунктов для выбранной службы";
  } catch (e: any) {
    error.value = e?.message ?? "Не удалось загрузить пункты выдачи";
  } finally {
    loading.value = false;
  }
};

watch(
    () => props.open,
    async (isOpen) => {
      if (!isOpen) return;
      await nextTick();
      await load();
    },
);
</script>
