// CafeteriaGroup table columns configuration
import { TableColumn, ColumnType } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  { 
    field: 'CafeteriaGroupID', 
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
    field: 'ProjectID', 
    label: 'Proje ID', 
    text: 'Proje ID',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'CafeteriaGroupName', 
    label: 'Kafeterya Grup Adı', 
    text: 'Kafeterya Grup Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '300px', 
    size: '300px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'CreatedAt', 
    label: 'Oluşturma Tarihi', 
    text: 'Oluşturma Tarihi',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '180px', 
    size: '180px',
    searchable: 'datetime',
    resizable: true
  },
  { 
    field: 'UpdatedAt', 
    label: 'Güncelleme Tarihi', 
    text: 'Güncelleme Tarihi',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '180px', 
    size: '180px',
    searchable: 'datetime',
    resizable: true
  }
];
