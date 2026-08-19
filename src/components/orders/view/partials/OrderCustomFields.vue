<template>
  <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
    <h3 class="text-sm font-semibold text-gray-900">Поля заказа</h3>

    <div v-if="!fields.length" class="mt-2 text-sm text-gray-500">
      Нет дополнительных полей
    </div>

    <dl v-else class="mt-4 divide-y divide-gray-100 text-sm">
      <div
        v-for="field in fields"
        :key="field.key"
        class="grid grid-cols-1 gap-2 py-3 sm:grid-cols-3 sm:items-start sm:gap-4"
      >
        <dt class="text-xs uppercase text-gray-500 sm:pt-1">
          {{ field.label }}
        </dt>

        <dd class="sm:col-span-2">
          <!-- read-only -->
          <div
            v-if="editingKey !== field.key"
            class="flex items-center justify-between gap-2"
          >
            <span class="break-words text-gray-900">{{
              formatValue(field)
            }}</span>
            <button
              type="button"
              class="shrink-0 text-gray-500 transition hover:text-gray-900"
              :disabled="saving"
              :title="`Изменить — ${field.label}`"
              @click="startEdit(field)"
            >
              <Pencil class="h-3.5 w-3.5" />
            </button>
          </div>

          <!-- edit -->
          <div v-else class="flex flex-wrap items-center gap-2">
            <Input
              v-if="field.type === 'text'"
              v-model="draftValue"
              type="text"
              class="h-9 max-w-md flex-1"
              :placeholder="field.label"
              @keydown.enter.prevent="saveField(field)"
              @keydown.esc.prevent="cancelEdit"
            />

            <label
              v-else-if="field.type === 'checkbox'"
              class="inline-flex h-9 items-center gap-2 px-1 text-sm text-gray-900"
            >
              <input
                v-model="draftValue"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span>{{ formatCheckboxValue(field, draftValue) }}</span>
            </label>

            <Select
              v-else-if="field.type === 'select'"
              v-model="draftValue"
              class="max-w-md flex-1"
              :options="field.options || []"
              option-label="label"
              option-value="value"
              :placeholder="field.label"
              searchable
            />

            <Button
              type="button"
              variant="default"
              size="sm"
              :disabled="saving"
              @click="saveField(field)"
            >
              {{ saving ? "..." : "Сохранить" }}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              :disabled="saving"
              @click="cancelEdit"
            >
              Отмена
            </Button>
          </div>
        </dd>
      </div>
    </dl>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { Pencil } from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";
import { Input } from "@/components/ui/input";
import Select from "@/components/dynamics/Dropdown/Select.vue";

const props = defineProps({
  fields: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["save"]);

const editingKey = ref(null);
const draftValue = ref(null);

const startEdit = (field) => {
  editingKey.value = field.key;
  if (field.type === "checkbox") {
    draftValue.value = Boolean(field.value);
  } else {
    draftValue.value = field.value ?? "";
  }
};

const cancelEdit = () => {
  editingKey.value = null;
  draftValue.value = null;
};

const saveField = (field) => {
  const value =
    field.type === "checkbox"
      ? Boolean(draftValue.value)
      : (draftValue.value ?? "");
  emit("save", {
    custom_fields: { [field.key]: value },
    onSuccess: cancelEdit,
  });
};

const formatValue = (field) => {
  if (field.type === "checkbox") return formatCheckboxValue(field, field.value);
  if (field.type === "select") {
    const opt = (field.options || []).find((o) => o.value === field.value);
    return opt?.label || field.value || "—";
  }
  return field.value || field.value === 0 ? String(field.value) : "—";
};

const formatCheckboxValue = (field, value) => {
  if (field.key === "no_receipt") {
    return value ? "Не пробивать" : "Пробивать";
  }

  return value ? "Да" : "Нет";
};
</script>
