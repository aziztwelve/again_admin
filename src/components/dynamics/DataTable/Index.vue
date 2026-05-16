<template>
  <div class="w-full flex flex-col items-end">

    <div class="rounded-md border w-full" ref="tableRef">
      <Table>
        <TableHeader class="text-xs bg-gray-100">
          <TableRow
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
          >
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
              />
            </TableHead>

            <TableHead class="w-2 no-print">
              <div class="w-full flex justify-end">
                <div>
                  <PrinterIcon
                      v-if="showPrintButton"
                      class="text-gray-700 hover:text-gray-800 transition cursor-pointer h-4 w-4"
                      @click="printTable"
                  />
                </div>

              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="text-xs text-gray-600">

          <template v-if="loading">
            <TableRow>
              <TableCell :colspan="table.getAllLeafColumns().length + 1" class="text-center p-4">

                <div class="inline-flex items-center gap-2 text-muted-foreground">
                  <Spinner/>
                  Загрузка данных...
                </div>

              </TableCell>
            </TableRow>
          </template>

          <template v-else-if="table.getRowModel().rows.length">
            <template v-for="row in table.getRowModel().rows" :key="row.id">

              <TableRow v-if="row.depth === 0" :data-state="row.getIsSelected() && 'selected'">
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()"/>
                </TableCell>
                <TableCell>
                  <div class="flex space-x-3 justify-end">

                    <template v-if="customActions">
                      <slot name="actions" :row="row"/>
                    </template>

                    <template v-else-if="restoreActions">
                      <ArchiveRestore
                          class="text-gray-500 hover:text-blue-600 transition cursor-pointer"
                          :size="18"
                          @click="emits('restore', row.original)"
                      />
                      <AlertDialog
                          title="Подтверждение удаления"
                          description="Вы уверены что хотите удалить?"
                          button-name="Удалить"
                          button-style="bg-red-500 hover:bg-red-600"
                          :icon="Trash2"
                          @continue="emits('hard_deleted', row.original)"
                      />
                    </template>
                    <template v-else>
                      <div class="flex space-x-2 justify-end">

                        <slot name="addActions" :item="row.original"/>


                        <Edit
                            v-if="editPermission"
                            :item="row.original"
                            :edit="edit"
                            @save_changes="emits('save_changes', $event)"
                        />

                        <AlertDialog
                            v-if="deletePermission"
                            :show-icon="true"
                            title="Подтверждение удаления"
                            description="Вы уверены что хотите удалить этот элемент?"
                            button-name="Удалить"
                            button-style="bg-red-500 hover:bg-red-600"
                            :icon="Trash2"
                            @continue="emits('deleted', row.original)"
                        />
                      </div>

                    </template>
                  </div>

                </TableCell>
              </TableRow>

              <!-- ПРЕДСТАВЛЕНИЕ ДОЧЕРНЕЙ СТРОКИ (depth > 0) -->
              <!-- дочерние строки -->
              <TableRow
                  v-else-if="row.depth > 0"
                  class="bg-gray-50"
              >
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()"/>
                </TableCell>
                <!-- теперь — тот же слот actions -->
                <TableCell>
                  <div class="flex space-x-3 justify-end">
                    <slot name="actionsVariant" :row="row"/>
                  </div>
                </TableCell>
              </TableRow>
            </template>


          </template>

          <template v-else>
            <TableRow>
              <TableCell :colspan="table.getAllLeafColumns().length + 1" class="text-center p-4">
                Нет данных
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>


    <div class="w-full flex justify-between">


      <div class="content-end">
        <ShowTotal
            class=""
            v-if="showTotal"
            :title="showTotal.title"
            :total="showTotal.total"
        />
      </div>

      <PaginationTable
          :show-per-page-option="!!pagination"
          :items-per-page-options="[
            5,10,15,20,50,100,150,200
        ]"
          :default-page="pagination?.page"
          :items-per-page="pagination?.per_page"
          :total="pagination?.total"
          @items-per-page-change="pagination.per_page = $event"
          @current-page="pagination.page = $event;"
      />

    </div>


  </div>
</template>

<script setup lang="ts">
import {valueUpdater} from "@/lib/utils";
import type {ColumnFiltersState, SortingState} from "@tanstack/vue-table";
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import {Trash2, ArchiveRestore, PrinterIcon} from "lucide-vue-next";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Edit from "@/components/dynamics/DataTable/Edit.vue";
import AlertDialog from "@/components/dynamics/AlertDialog.vue";
import Loader from "@/components/common/Loader.vue";
import {ref, PropType, watch, computed} from "vue";
import PaginationTable from "@/components/PaginationTable.vue";
import {Pagination, PaginationMeta, ShowTotalType} from "@/types/Types";
import ShowTotal from "@/components/dynamics/ShowTotal.vue";
import {Spinner} from "@/components/ui/spinner";


const props = defineProps({
  data: Array,
  columns: Array,
  edit: Object,
  customActions: Boolean,
  restoreActions: Boolean,
  showDeleteActions: Boolean,
  showDeleteEditActions: Boolean,
  show: Object,
  loading: Boolean,

  showPrintButton: {
    type: Boolean,
    default: true
  },
  printTitle: {
    type: String,
    default: 'Документ'
  },

  deletePermission: {
    type: Boolean,
    default: true
  },
  editPermission: {
    type: Boolean,
    default: true
  },
  subRowsField: String,

  pagination: {
    type: Object as PropType<Pagination | PaginationMeta>,
    default: null
  },
  showTotal: {
    type: Object as PropType<ShowTotalType>,
    default: null
  }

});


const emits = defineEmits([
  "deleted",
  "save_changes",
  "hard_deleted",
  "restore",
  "show",
  "edit",
  "paginationChange",
]);


const data = computed(() => props.data ?? [])
let columns = props.columns;

const subRowsField = props.subRowsField || 'variants'

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);

const table = useVueTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  getSubRows: row => (row as any)[subRowsField] || [],

  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: (updaterOrValue) =>
      valueUpdater(updaterOrValue, columnFilters),
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
  },
});

const tableRef = ref(null);

const printTable = () => {
  try {
    if (!tableRef.value) {
      console.error("Table reference not found");
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert("Пожалуйста, разрешите всплывающие окна для этого сайта");
      return;
    }

    // Клонируем таблицу, чтобы не модифицировать оригинал
    const tableClone = tableRef.value.cloneNode(true);

    // Скрываем кнопки действий
    const actionCells = tableClone.querySelectorAll('td:last-child');
    actionCells.forEach(cell => cell.classList.add('no-print'));

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${props.printTitle}</title>
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
          }
          .print-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .print-date {
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="print-header">
<!--          <div class="print-title">${props.printTitle}</div>-->
<!--          <div class="print-date">${new Date().toLocaleDateString()}</div>-->
        </div>
        ${tableClone.innerHTML}
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          };
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  } catch (error) {
    console.error("Print error:", error);
    alert("Произошла ошибка при печати");
  }
};


watch(
    () => props.pagination,
    () => {
      emits("paginationChange")
    },
    {deep: true}
)

// watch(
//     () => props.loading,
//     (value) => {
//       if (!value) {
//         console.log(value);
//         renderTable.value++
//       }
//     }
// )


</script>
<style>

</style>
