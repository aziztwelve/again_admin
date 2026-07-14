<template>
  <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-sm font-semibold text-gray-900">Комментарий продавца</h3>
      <button
        v-if="!editing"
        type="button"
        class="shrink-0 text-gray-500 transition hover:text-gray-900"
        :disabled="saving"
        title="Изменить комментарий продавца"
        @click="startEdit"
      >
        <Pencil class="h-3.5 w-3.5" />
      </button>
    </div>

    <!-- read-only -->
    <template v-if="!editing">
      <p v-if="!order.seller_comment" class="mt-2 text-sm text-gray-500">
        Нет комментария
      </p>
      <p v-else class="mt-2 whitespace-pre-line text-sm text-gray-900">
        {{ order.seller_comment }}
      </p>
    </template>

    <!-- edit -->
    <div v-else class="mt-2">
      <textarea
        v-model="draft"
        rows="4"
        class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
        placeholder="Внутренний комментарий продавца (не виден покупателю)"
        @keydown.esc.prevent="cancelEdit"
      />
      <div class="mt-2 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="default"
          size="sm"
          :disabled="saving"
          @click="save"
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
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { Pencil } from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";

const props = defineProps({
  order: { type: Object, required: true },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["save"]);

const editing = ref(false);
const draft = ref("");

const startEdit = () => {
  draft.value = props.order?.seller_comment ?? "";
  editing.value = true;
};

const cancelEdit = () => {
  editing.value = false;
  draft.value = "";
};

const save = () => {
  emit("save", {
    seller_comment: (draft.value ?? "").trim(),
    onSuccess: () => {
      editing.value = false;
    },
  });
};
</script>
