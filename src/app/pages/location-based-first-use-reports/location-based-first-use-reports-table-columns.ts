// LocationBasedFirstUseReports table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  { 
    field: 'Date', 
    label: 'Tarih', 
    text: 'Tarih',
    type: 'date' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'date' as ColumnType,
    resizable: true,
    hidden: true // Hidden column, only used for filtering
  },
  { 
    field: 'CafeteriaGroupName', 
    label: 'Kafeterya Grup Adı', 
    text: 'Kafeterya Grup Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'Location', 
    label: 'Konum', 
    text: 'Konum',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'Count', 
    label: 'Sayı', 
    text: 'Sayı',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    align: 'right'
  }
];
