// PackageBasedSubscriptionSalesReports form configuration (read-only report view)
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

export const formFields: TableColumn[] = [
  {
    field: 'PackageName',
    label: 'Paket Adı',
    text: 'Paket Adı',
    type: 'enum' as ColumnType,
    fullWidth: true,
    disabled: true,
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
  { field: 'Day', label: 'Gün', text: 'Gün', type: 'date' as ColumnType, fullWidth: true, disabled: true },
  { field: 'Qty', label: 'Adet', text: 'Adet', type: 'int' as ColumnType, fullWidth: true, disabled: true },
  { field: 'Price', label: 'Birim Fiyat', text: 'Birim Fiyat', type: 'float' as ColumnType, fullWidth: true, disabled: true },
  { field: 'TotalPrice', label: 'Toplam Fiyat', text: 'Toplam Fiyat', type: 'float' as ColumnType, fullWidth: true, disabled: true },
  { field: 'DaysCount', label: 'Gün Sayısı', text: 'Gün Sayısı', type: 'int' as ColumnType, fullWidth: true, disabled: true },
];

export const formTabs: FormTab[] = [
  { label: 'Paket Bazlı Satış Bilgisi', fields: ['PackageName', 'Day', 'Qty', 'Price', 'TotalPrice', 'DaysCount'] },
];

export const formLoadUrl = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/SubscriptionEvents/PackageBasedSubscriptionSales`;
export const formLoadRequest = (recid: any) => ({ recid });
export const formDataMapper = (apiRecord: any): any => apiRecord;
