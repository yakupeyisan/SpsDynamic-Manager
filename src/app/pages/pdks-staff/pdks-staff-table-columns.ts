// PdksStaff (Kadro) table columns configuration
import { TableColumn, ColumnType } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  { 
    field: 'ID', 
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
    label: 'Kadro Adı', 
    text: 'Kadro Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '250px', 
    size: '250px',
    searchable: 'text',
    resizable: true
  }
];
