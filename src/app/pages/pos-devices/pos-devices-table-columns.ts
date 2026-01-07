// PosDevices table columns configuration
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
    field: 'Name', 
    label: 'Ad', 
    text: 'Ad',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '300px', 
    size: '300px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'PlaceID', 
    label: 'Bölge', 
    text: 'Bölge',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true,
    joinTable: 'CafeteriaPlace'
  },
  { 
    field: 'AccountId', 
    label: 'Hesap', 
    text: 'Hesap',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true,
    joinTable: 'CafeteriaAccount'
  },
  { 
    field: 'PosSerial', 
    label: 'POS Seri No', 
    text: 'POS Seri No',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'Status', 
    label: 'Durum', 
    text: 'Durum',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'LastConnectionTime', 
    label: 'Son Bağlantı', 
    text: 'Son Bağlantı',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '180px', 
    size: '180px',
    searchable: 'datetime',
    resizable: true
  }
];
