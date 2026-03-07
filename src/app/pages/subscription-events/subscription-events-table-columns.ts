// SubscriptionEvents table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  { 
    field: 'SubscriptionEventsID', 
    label: 'ID', 
    text: 'ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true
  },
  { 
    field: 'FullName', 
    label: 'Ad Soyad', 
    text: 'Ad Soyad',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '180px', 
    size: '180px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'TagCode', 
    label: 'Tag Kodu', 
    text: 'Tag Kodu',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '130px', 
    size: '130px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'PackageID', 
    label: 'Paket ID', 
    text: 'Paket ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '110px', 
    size: '110px',
    min: 20,
    searchable: 'int' as ColumnType,
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
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true
  },
  { 
    field: 'CafeteriaEventID', 
    label: 'Kafeterya Olay ID', 
    text: 'Kafeterya Olay ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '130px', 
    size: '130px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true
  },
  { 
    field: 'Day', 
    label: 'Gün', 
    text: 'Gün',
    type: 'date' as ColumnType, 
    sortable: true, 
    width: '110px', 
    size: '110px',
    min: 20,
    searchable: 'date' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const raw = record['Day'];
      if (raw == null) return '';
      const date = new Date(raw);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit' });
      }
      return String(raw ?? '');
    }
  },
  { 
    field: 'isUsed', 
    label: 'Kullanıldı mı', 
    text: 'Kullanıldı mı',
    type: 'enum' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'enum' as ColumnType,
    resizable: true,
    options: [
      { label: 'Evet', value: true },
      { label: 'Hayır', value: false }
    ],
    render: (record: TableRow) => (record['isUsed'] ? 'Evet' : 'Hayır')
  },
  { 
    field: 'AccessZoneId', 
    label: 'Erişim Bölgesi ID', 
    text: 'Erişim Bölgesi ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '140px', 
    size: '140px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true
  },
  { 
    field: 'CreatedAt', 
    label: 'Oluşturma Tarihi', 
    text: 'Oluşturma Tarihi',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '160px', 
    size: '160px',
    min: 20,
    searchable: 'datetime' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const value = record['CreatedAt'];
      if (!value) return '';
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('tr-TR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
      return String(value ?? '');
    }
  },
  { 
    field: 'Operator', 
    label: 'Operatör', 
    text: 'Operatör',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '140px', 
    size: '140px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  }
];

