// PayStations table columns configuration
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
    field: 'Location', 
    label: 'Konum', 
    text: 'Konum',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '300px', 
    size: '300px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'DeviceSerial', 
    label: 'Cihaz Seri No', 
    text: 'Cihaz Seri No',
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
    field: 'CashBoxLevel', 
    label: 'Kasa Seviyesi', 
    text: 'Kasa Seviyesi',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'int',
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
