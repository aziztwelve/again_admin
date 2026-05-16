import {PaginationMeta} from "@/types/Types";
import type {ColumnDef} from "@tanstack/vue-table";
import {h} from 'vue'

export function useTableColumns() {
    /**
     * Создает колонку с порядковым номером
     */
    const createIndexColumn = (pagination?: PaginationMeta): ColumnDef<any> => {
        return {
            accessorKey: "id",
            header: "№",
            cell: ({row}: any) => {
                const currentPage = Number(pagination?.page ?? 1);
                const perPage = Number(pagination?.per_page ?? 10);
                const rowIndex = Number(row?.index ?? 0);

                return (currentPage - 1) * perPage + rowIndex + 1;
            }
        };
    };

    const createClickableColumn = (
        accessorKey: string,
        header: string,
        onClick: (row: any) => void,
        options?: {
            class?: string;
        }
    ) => ({
        accessorKey,
        header,
        cell: ({row}: any) => {
            return h(
                "button",
                {
                    class: options?.class || "text-blue-600 hover:underline cursor-pointer text-left",
                    onClick: () => onClick(row.original)
                },
                row.getValue(accessorKey)
            );
        }
    });

    return {
        createIndexColumn,
        createClickableColumn
    };
}