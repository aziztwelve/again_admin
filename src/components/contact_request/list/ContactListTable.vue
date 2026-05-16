<template>
  <DynamicsDataTable
      :data="items"
      :columns="columns"
      :show-print-button="false"
      :edit="edit"
      :pagination="pagination"
      @deleted="handleDeleted"
      @save_changes="handleSave"
  >
  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {h, onMounted, ref} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import ContactRequest from "@/models/ContactRequest";
import {useContactRequestFunctions} from "@/composables/useContactRequestFunctions";
import {useDateFormat} from "@/composables/useDateFormat";
import ContactEdit from "@/components/contact_request/ContactEdit.vue";
import {useStatusFunctions} from "@/composables/useStatusFunctions";
import {PaginationMeta} from "@/types/Types";
import {useTableColumns} from "@/composables/Table/useTableColumns";
import AttachManager from "@/components/contact_request/list/manager/AttachManager.vue";
import {useUserFunctions} from "@/composables/userFunctions";


interface Props {
  items: ContactRequest[];
  loading: boolean;
  pagination: PaginationMeta
}

const props = defineProps<Props>();

const emits = defineEmits(["deleted", "updated"]);

const users = ref<[]>([]);

const {getStatus} = useStatusFunctions();
const {deleteContactRequest, updateContactRequest} = useContactRequestFunctions();
const {getUsers} = useUserFunctions()

onMounted(() => {
  if (users.value.length < 1) {
    getUsers(1, 50)
        .then((res: any) => {
          users.value = res.users?.data ?? []
        })
  }
})


const {createIndexColumn} = useTableColumns()

const edit = ref({
  title: "Изменение статуса",
  description: "Здесь вы можете изменить «Статус» заявки",
  component: ContactEdit,
  loader: false,
});


const columns = [

  createIndexColumn(props.pagination),

  {
    accessorKey: "created_at",
    header: "Создан",
    cell: ({row}: any) =>
        h(
            "span",
            {class: "whitespace-nowrap"},
            useDateFormat().formatDateToRussian(row.original?.created_at)
        ),
  },
  {
    accessorKey: "name",
    header: "Имя",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Телефон",
    cell: ({row}: any) =>
        h(
            "span",
            {class: "whitespace-nowrap"},
            row.original.phone
        ),
  },

  {
    accessorKey: "status",
    header: "Статус",
    cell: ({row}: any) => {
      const status = getStatus("contactRequest", row.original.status);
      return h(
          "span",
          {
            style: {backgroundColor: status.color},
            class: `px-2 py-1 rounded text-white whitespace-nowrap`,
          },
          status.label
      );
    },
  },

  {
    accessorKey: "manager",
    header: "Менеджер",
    cell: ({row}: any) => {
      return h(AttachManager, {
        contactRequestId: row.original.id,
        managerId: row.original.manager_id,
        managerName: row.original.manager?.full_name,
        users: users.value,
        onUpdated: () => emits('updated')
      });
    },
  },

  {
    accessorKey: "client.profile.fullName",
    header: "Клиент",
  },
  {
    accessorKey: "client.email",
    header: "Клиент email",
  },

  {
    accessorKey: "message",
    header: "Сообщение",
  },
  {
    accessorKey: "source",
    header: "Источник",
  },

  {
    accessorKey: "meta.banner_name",
    header: "ОТО баннер",
  },

  {
    accessorKey: "meta.input_fields.value",
    header: "Сообщение ОТО баннер",
  },
];

const handleDeleted = async (request: ContactRequest) => {
  if (!request.id) return;
  await deleteContactRequest(request.id);
  emits("deleted");
};

const handleSave = async (request: ContactRequest) => {
  if (!request.id) return;

  await updateContactRequest(request.id, {
    status: request.status ?? 'new',
  })
  emits('updated')
};
</script>