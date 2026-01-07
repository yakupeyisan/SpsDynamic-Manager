// TerminalTariffs table columns configuration
import { TableColumn, ColumnType } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  { 
    field: 'TariffID', 
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
    field: 'TerminalName', 
    label: 'Terminal', 
    text: 'Terminal',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    searchable: false,
    resizable: true,
    render: (record: any) => record.Terminal?.TerminalName || record.Terminal?.Name || '',
    joinTable: 'Terminal'
  },
  { 
    field: 'CafeteriaGroupName', 
    label: 'Kafeterya Grubu', 
    text: 'Kafeterya Grubu',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    searchable: false,
    resizable: true,
    render: (record: any) => record.CafeteriaGroup?.CafeteriaGroupName || record.CafeteriaGroup?.Name || '',
    joinTable: 'CafeteriaGroup'
  },
  { 
    field: 'App1FirstPassFee', 
    label: 'Uyg.1 İlk Geçiş', 
    text: 'Uyg.1 İlk Geçiş',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'float',
    resizable: true
  },
  { 
    field: 'App1SecondPassFee', 
    label: 'Uyg.1 İkinci Geçiş', 
    text: 'Uyg.1 İkinci Geçiş',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '130px', 
    size: '130px',
    searchable: 'float',
    resizable: true
  },
  { 
    field: 'App2FirstPassFee', 
    label: 'Uyg.2 İlk Geçiş', 
    text: 'Uyg.2 İlk Geçiş',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'float',
    resizable: true
  },
  { 
    field: 'App2SecondPassFee', 
    label: 'Uyg.2 İkinci Geçiş', 
    text: 'Uyg.2 İkinci Geçiş',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '130px', 
    size: '130px',
    searchable: 'float',
    resizable: true
  },
  { 
    field: 'ReaderID', 
    label: 'Terminal ID', 
    text: 'Terminal ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'int',
    resizable: true,
    joinTable: 'Terminal'
  },
  { 
    field: 'CafeteriaGroupID', 
    label: 'Kafeterya Grup ID', 
    text: 'Kafeterya Grup ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'int',
    resizable: true,
    joinTable: 'CafeteriaGroup'
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
