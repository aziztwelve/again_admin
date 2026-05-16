<template>
  <div class="relative  w-full bg-white rounded-xl p-5 shadow-md border border-gray-100">
    <!-- Заголовок и пояснение -->
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-800">Динамика заказов{{ titleSuffix }}</h3>
      <p class="text-sm text-gray-500 mt-1">
        Визуализация показывает изменение количества заказов по всем статусам
      </p>
    </div>

    <!-- График -->
    <LineChart
        :chartData="chartData"
        :options="options"
        class="mt-2"
    />

    <!-- Подпись и дата -->
    <div class="absolute bottom-4 right-4 text-xs text-gray-400 flex items-center mb-10">
      <Clock class="h-3 w-3 mr-1 text-gray-400" />
      Обновлено: {{ new Date().toLocaleDateString() }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { LineChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
import { computed } from 'vue';
import { Clock } from 'lucide-vue-next';


Chart.register(...registerables);

interface PeriodInfo {
  from: string | null;
  to: string | null;
  preset: 'day' | '3days' | 'week' | 'month' | 'year' | '2years' | 'all' | 'custom';
}

const props = defineProps<{
  chartData: Record<string, any> & { labels?: string[]; from?: string; to?: string };
  period?: PeriodInfo;
}>();

const PRESET_TITLES: Record<Exclude<PeriodInfo['preset'], 'custom' | 'all'>, string> = {
  day:    ' за сегодня',
  '3days':' за последние 3 дня',
  week:   ' за последнюю неделю',
  month:  ' за последний месяц',
  year:   ' за последний год',
  '2years':' за последние 2 года',
};

const formatDate = (s: string): string => {
  const [y, m, d] = s.split('-');
  return `${d}.${m}.${y}`;
};

const titleSuffix = computed(() => {
  const p = props.period;
  if (!p) return ' за последние 6 месяцев';

  if (p.preset === 'all') {
    // Берём фактический диапазон из ответа бэка (min/max created_at).
    const cdFrom = props.chartData?.from;
    const cdTo = props.chartData?.to;
    if (cdFrom && cdTo) return ` за всё время (${formatDate(cdFrom)} — ${formatDate(cdTo)})`;
    return ' за всё время';
  }

  if (p.preset === 'custom') {
    if (p.from && p.to) return ` за период ${formatDate(p.from)} — ${formatDate(p.to)}`;
    return '';
  }

  return PRESET_TITLES[p.preset] ?? '';
});

// Метаданные по всем статусам заказов (синхронизировано с App\Enums\OrderStatus)
const STATUS_META: Record<string, { label: string; color: string }> = {
  new:            { label: 'Новые',              color: '#EF4444' },
  processing:     { label: 'В обработке',        color: '#F59E0B' },
  shipped:        { label: 'Отгружен',           color: '#7391ec' },
  shipped_export: { label: 'Отгружен на экспорт',color: '#9333ea' },
  delivered:      { label: 'Доставлен',          color: '#6fbaba' },
  cancelled:      { label: 'Отменён',            color: '#f88686' },
  product_return: { label: 'Возврат товара',     color: '#fb923c' },
};

function hexToRgba(hex: string, alpha = 0.05): string {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const chartData = computed(() => {
  const cd = props.chartData ?? { labels: [] };
  const datasets = Object.keys(STATUS_META)
      .filter((status) => Array.isArray(cd[status]))
      .map((status) => {
        const meta = STATUS_META[status];
        return {
          label: meta.label,
          data: cd[status] ?? [],
          borderColor: meta.color,
          backgroundColor: hexToRgba(meta.color, 0.05),
          borderWidth: 3,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: meta.color,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        };
      });

  return {
    labels: cd.labels ?? [],
    datasets,
  };
});

// Красивые настройки графика
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#4B5563',
        font: {
          family: 'Inter, sans-serif',
          size: 13,
          weight: '500'
        },
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 8
      }
    },
    tooltip: {
      backgroundColor: '#1F2937',
      titleColor: '#F9FAFB',
      bodyColor: '#F9FAFB',
      borderColor: '#374151',
      borderWidth: 1,
      padding: 12,
      usePointStyle: true,
      callbacks: {
        label: (context) => {
          return ` ${context.dataset?.label}: ${context.parsed.y} заказов`;
        },
        labelColor: (context) => {
          return {
            borderColor: context?.dataset.borderColor,
            backgroundColor: context?.dataset.borderColor,
            borderRadius: 2
          };
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        color: '#6B7280',
        font: {
          family: 'Inter, sans-serif'
        }
      }
    },
    y: {
      grid: {
        color: '#F3F4F6',
        drawBorder: false,
        tickLength: 8
      },
      ticks: {
        color: '#6B7280',
        font: {
          family: 'Inter, sans-serif'
        },
        precision: 0
      },
      beginAtZero: true,
      min: 0
    }
  },
  elements: {
    line: {
      cubicInterpolationMode: 'monotone'
    }
  }
};

// onMounted(() => {
//   console.log('Данные графика:', props.chartData);
// });
</script>
