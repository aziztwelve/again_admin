<template>
  <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
    <h3 class="text-sm font-semibold text-gray-900">История</h3>
    <ul v-if="history.length" class="mt-4 space-y-3">
      <li
        v-for="entry in history"
        :key="entry.id"
        class="flex items-start gap-3 text-sm"
      >
        <div
          class="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
          :class="dotClass(entry.action)"
        />
        <div class="flex-1">
          <div class="text-gray-500 text-xs">
            {{ formatDate(entry.created_at) }}
          </div>
          <div class="text-gray-900">
            {{ entry.description || "—" }}
          </div>
          <div v-if="entry.user" class="mt-0.5 text-xs text-gray-500">
            {{ entry.user.name || "—" }}
            <span v-if="entry.user.role"> · {{ entry.user.role }}</span>
          </div>
        </div>
      </li>
    </ul>
    <p v-else class="mt-2 text-sm text-gray-500">Нет записей</p>
  </section>
</template>

<script setup>
defineProps({
  history: { type: Array, default: () => [] },
});

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const dotClass = (action) => {
  switch (action) {
    case "created":
    case "item_added":
      return "bg-green-500";
    case "updated":
      return "bg-blue-500";
    case "deleted":
    case "item_removed":
      return "bg-red-500";
    case "copied":
      return "bg-orange-400";
    default:
      return "bg-gray-300";
  }
};
</script>
