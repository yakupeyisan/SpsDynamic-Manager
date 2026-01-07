// CafeteriaMenus table columns configuration
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
    field: 'PlaceId', 
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
    field: 'Name', 
    label: 'Menü Adı', 
    text: 'Menü Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '300px', 
    size: '300px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'CafeteriaAppName', 
    label: 'Kafeterya Uygulama Adı', 
    text: 'Kafeterya Uygulama Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '250px', 
    size: '250px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'MenuDay', 
    label: 'Menü Günü', 
    text: 'Menü Günü',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'int',
    resizable: true
  }
];
