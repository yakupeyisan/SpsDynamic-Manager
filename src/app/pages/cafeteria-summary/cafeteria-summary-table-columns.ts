// CafeteriaSummary table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  { 
    field: 'StartDate', 
    label: 'Tarih', 
    text: 'Tarih',
    type: 'date' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'date' as ColumnType,
    resizable: true,
    hidden: true // Hidden column, only used for filtering
  },
  { 
    field: 'ApplicationName', 
    label: 'Uygulama Adı', 
    text: 'Uygulama Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
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
    field: 'Subscription', 
    label: 'Abonelik', 
    text: 'Abonelik',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    align: 'right'
  },
  { 
    field: 'FirstPass', 
    label: 'İlk Geçiş', 
    text: 'İlk Geçiş',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    align: 'right'
  },
  { 
    field: 'FirstPassPrice', 
    label: 'İlk Geçiş Fiyatı', 
    text: 'İlk Geçiş Fiyatı',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: false,
    resizable: true,
    align: 'right',
    render: (record: TableRow) => {
      const price = record['FirstPassPrice'];
      if (price !== undefined && price !== null) {
        const priceInTL = Number(price) / 100;
        return priceInTL.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' ₺';
      }
      return '0,00 ₺';
    }
  },
  { 
    field: 'SecondPass', 
    label: 'İkinci Geçiş', 
    text: 'İkinci Geçiş',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    align: 'right'
  },
  { 
    field: 'SecondPassPrice', 
    label: 'İkinci Geçiş Fiyatı', 
    text: 'İkinci Geçiş Fiyatı',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: false,
    resizable: true,
    align: 'right',
    render: (record: TableRow) => {
      const price = record['SecondPassPrice'];
      if (price !== undefined && price !== null) {
        const priceInTL = Number(price) / 100;
        return priceInTL.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' ₺';
      }
      return '0,00 ₺';
    }
  }
];
