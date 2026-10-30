import { CaretUpDownIcon } from "@repo/icons";
import { Button } from "@repo/ui/components/button";
import { TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import type { ReactTable, RowData } from "@tanstack/react-table";
import type { sortableTableFeatures } from "./features";

export function SortableTableHeader<TData extends RowData>({
  table,
  headClassName,
}: {
  table: ReactTable<typeof sortableTableFeatures, TData>;
  headClassName?: Partial<Record<string, string>>;
}) {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const label = String(header.column.columnDef.header);
            const sortable = header.column.getCanSort();
            const direction = header.column.getIsSorted();
            return (
              <TableHead
                key={header.id}
                // eslint-disable-next-line shadcn/require-static-classes
                className={headClassName?.[header.id]}
                aria-sort={
                  direction === "asc"
                    ? "ascending"
                    : direction === "desc"
                      ? "descending"
                      : undefined
                }
              >
                {sortable ? (
                  <Button
                    type="button"
                    variant="muted"
                    size="xs"
                    onClick={header.column.getToggleSortingHandler()}
                    className="-mx-1.5"
                  >
                    {label}
                    <CaretUpDownIcon
                      className="size-3 opacity-60"
                      aria-hidden="true"
                    />
                  </Button>
                ) : (
                  label
                )}
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );
}
