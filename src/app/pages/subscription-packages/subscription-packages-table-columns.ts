// SubscriptionPackages table columns configuration
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
    field: 'ApplicationName', 
    label: 'Uygulama', 
    text: 'Uygulama',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    searchable: false,
    resizable: true,
    render: (record: any) => record.Application?.Name || record.Application?.ApplicationName || '',
    joinTable: 'Application'
  },
  { 
    field: 'Name', 
    label: 'Paket Adı', 
    text: 'Paket Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '250px', 
    size: '250px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'DayOfWeek', 
    label: 'Haftanın Günü', 
    text: 'Haftanın Günü',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'HowManyDays', 
    label: 'Kaç Gün', 
    text: 'Kaç Gün',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'Holiday', 
    label: 'Tatil', 
    text: 'Tatil',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'Amount', 
    label: 'Tutar', 
    text: 'Tutar',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'float',
    resizable: true
  },
  { 
    field: 'Status', 
    label: 'Durum', 
    text: 'Durum',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'StartRule', 
    label: 'Başlangıç Kuralı', 
    text: 'Başlangıç Kuralı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'StartDay', 
    label: 'Başlangıç Günü', 
    text: 'Başlangıç Günü',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '130px', 
    size: '130px',
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'MinOrderDay', 
    label: 'Min Sipariş Günü', 
    text: 'Min Sipariş Günü',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '140px', 
    size: '140px',
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'IsSelectable', 
    label: 'Seçilebilir', 
    text: 'Seçilebilir',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: 'checkbox',
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
    field: 'ApplicationID', 
    label: 'Uygulama ID', 
    text: 'Uygulama ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'int',
    resizable: true,
    joinTable: 'Application'
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
