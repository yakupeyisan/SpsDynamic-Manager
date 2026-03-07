// PackageBasedSubscriptionSalesReports table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

export const tableColumns: TableColumn[] = [
  {
    field: 'PackageName',
    label: 'Paket Adı',
    text: 'Paket Adı',
    type: 'enum' as ColumnType,
    sortable: true,
    width: '220px',
    size: '220px',
    min: 20,
    searchable: 'enum' as ColumnType,
    resizable: true,
    load: {
      url: `${apiUrl}/api/SubscriptionPackages`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        if (!data?.records || !Array.isArray(data.records)) return [];
        return data.records.map((item: any) => ({
          id: item.Name ?? item.PackageName ?? '',
          text: item.Name ?? item.PackageName ?? '',
        }));
      },
    },
  },
  {
    field: 'Day',
    label: 'Gün',
    text: 'Gün',
    type: 'date' as ColumnType,
    sortable: true,
    width: '120px',
    size: '120px',
    min: 20,
    searchable: 'date' as ColumnType,
    resizable: true,
    hidden: true, // Kolonlarda görünmez, sadece aramada/filtrede kullanılır
    render: (record: TableRow) => {
      const raw = record['Day'];
      if (raw == null) return '';
      const date = new Date(raw);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit' });
      }
      return String(raw ?? '');
    },
  },
  {
    field: 'Qty',
    label: 'Adet',
    text: 'Adet',
    type: 'int' as ColumnType,
    sortable: true,
    width: '100px',
    size: '100px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true,
  },
  {
    field: 'Price',
    label: 'Birim Fiyat',
    text: 'Birim Fiyat',
    type: 'float' as ColumnType,
    sortable: true,
    width: '120px',
    size: '120px',
    min: 20,
    searchable: 'float' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const v = record['Price'];
      if (v == null) return '';
      return Number(v).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
  },
  {
    field: 'TotalPrice',
    label: 'Toplam Fiyat',
    text: 'Toplam Fiyat',
    type: 'float' as ColumnType,
    sortable: true,
    width: '140px',
    size: '140px',
    min: 20,
    searchable: 'float' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const v = record['TotalPrice'];
      if (v == null) return '';
      return Number(v).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
  },
  {
    field: 'DaysCount',
    label: 'Gün Sayısı',
    text: 'Gün Sayısı',
    type: 'int' as ColumnType,
    sortable: true,
    width: '110px',
    size: '110px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true,
  },
];
