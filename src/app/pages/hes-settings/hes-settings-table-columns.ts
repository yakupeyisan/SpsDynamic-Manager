// HesSettings table columns configuration
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
    field: 'ApiUrl', 
    label: 'API URL', 
    text: 'API URL',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '300px', 
    size: '300px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'HesCodeField', 
    label: 'HES Kodu Alanı', 
    text: 'HES Kodu Alanı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'IsVaccinated', 
    label: 'Aşılı', 
    text: 'Aşılı',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'IsImmune', 
    label: 'Bağışıklı', 
    text: 'Bağışıklı',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'LastNegativeTestDateDay', 
    label: 'Son Negatif Test Günü', 
    text: 'Son Negatif Test Günü',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'Delay', 
    label: 'Gecikme', 
    text: 'Gecikme',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: 'int',
    resizable: true
  }
];
