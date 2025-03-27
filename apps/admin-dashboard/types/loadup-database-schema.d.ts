declare module '@loadup/database/schema' {
  import { PgTable, PgColumn } from 'drizzle-orm/pg-core';
  import { ColumnBaseConfig, ColumnDataType, TableConfig } from 'drizzle-orm';

  interface ShipmentsTable extends PgTable<TableConfig> {
    id: PgColumn<ColumnBaseConfig<ColumnDataType, string>>;
    status: PgColumn<ColumnBaseConfig<ColumnDataType, string>>;
    updatedAt: PgColumn<ColumnBaseConfig<ColumnDataType, string>>;
  }

  interface ShipmentHistoryTable extends PgTable<TableConfig> {
    shipmentId: PgColumn<ColumnBaseConfig<ColumnDataType, string>>;
    status: PgColumn<ColumnBaseConfig<ColumnDataType, string>>;
    updatedById: PgColumn<ColumnBaseConfig<ColumnDataType, string>>;
    notes: PgColumn<ColumnBaseConfig<ColumnDataType, string>>;
    location: PgColumn<ColumnBaseConfig<ColumnDataType, string>>;
    timestamp: PgColumn<ColumnBaseConfig<ColumnDataType, string>>;
  }

  interface UsersTable extends PgTable<TableConfig> {
    id: PgColumn<ColumnBaseConfig<ColumnDataType, string>>;
    email: PgColumn<ColumnBaseConfig<ColumnDataType, string>>;
  }

  export const shipments: ShipmentsTable;
  export const shipmentHistory: ShipmentHistoryTable;
  export const users: UsersTable;
} 