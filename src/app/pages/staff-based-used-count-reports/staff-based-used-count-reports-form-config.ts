// StaffBasedUsedCountReports form configuration (read-only report view)
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

export const formFields: TableColumn[] = [
  { field: 'ID', label: 'ID', text: 'ID', type: 'int' as ColumnType, fullWidth: true, disabled: true },
  { field: 'Name', label: 'Kadro', text: 'Kadro', type: 'text' as ColumnType, fullWidth: true, disabled: true },
  { field: 'SaleCount', label: 'Satış Sayısı', text: 'Satış Sayısı', type: 'int' as ColumnType, fullWidth: true, disabled: true },
  { field: 'UsedCount', label: 'Kullanım Sayısı', text: 'Kullanım Sayısı', type: 'int' as ColumnType, fullWidth: true, disabled: true },
];

export const formTabs: FormTab[] = [
  { label: 'Kadro Bazlı Kullanım Bilgisi', fields: ['ID', 'Name', 'SaleCount', 'UsedCount'] },
];

export const formLoadUrl = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CafeteriaEvents/StaffBasedSaleAndUsedCounts`;
export const formLoadRequest = (recid: any) => ({ recid });
export const formDataMapper = (apiRecord: any): any => apiRecord;
