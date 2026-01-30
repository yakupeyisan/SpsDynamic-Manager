// RequestClaims table columns configuration
import { TableColumn, ColumnType } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  {
    field: 'Id',
    label: 'ID',
    text: 'ID',
    type: 'int' as ColumnType,
    sortable: true,
    width: '80px',
    size: '80px',
    searchable: 'int',
    resizable: true
  },
  {
    field: 'ClaimName',
    label: 'Talep Adı',
    text: 'Talep Adı',
    type: 'text' as ColumnType,
    sortable: true,
    width: '200px',
    size: '200px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'Description',
    label: 'Açıklama',
    text: 'Açıklama',
    type: 'text' as ColumnType,
    sortable: true,
    width: '250px',
    size: '250px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'RequestedAt',
    label: 'Talep Tarihi',
    text: 'Talep Tarihi',
    type: 'datetime' as ColumnType,
    sortable: true,
    width: '150px',
    size: '150px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'ApprovedAt',
    label: 'Onay Tarihi',
    text: 'Onay Tarihi',
    type: 'datetime' as ColumnType,
    sortable: true,
    width: '150px',
    size: '150px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'RejectedAt',
    label: 'Red Tarihi',
    text: 'Red Tarihi',
    type: 'datetime' as ColumnType,
    sortable: true,
    width: '150px',
    size: '150px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'ResponseMessage',
    label: 'Yanıt Mesajı',
    text: 'Yanıt Mesajı',
    type: 'text' as ColumnType,
    sortable: true,
    width: '200px',
    size: '200px',
    searchable: 'text',
    resizable: true
  }
];
