// CustomFieldSettings table columns configuration
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
    field: 'Field', 
    label: 'Alan', 
    text: 'Alan',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'Text', 
    label: 'Metin', 
    text: 'Metin',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'Type', 
    label: 'Tip', 
    text: 'Tip',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'IsVisible', 
    label: 'Görünür', 
    text: 'Görünür',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: true,
    resizable: true
  },
  { 
    field: 'IsDisable', 
    label: 'Devre Dışı', 
    text: 'Devre Dışı',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: true,
    resizable: true
  }
];
