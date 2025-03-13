import React from 'react';
import { cn } from '../../lib/utils.js';

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey?: keyof T;
    cell?: ({ row }: { row: { original: T } }) => React.ReactNode;
  }[];
  className?: string;
}

export function DataTable<T>({ data, columns, className }: DataTableProps<T>) {
  return (
    <div className={cn('rounded-md border', className)}>
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="p-4 align-middle"
                  >
                    {column.cell
                      ? column.cell({ row: { original: row } })
                      : column.accessorKey
                      ? String(row[column.accessorKey])
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 