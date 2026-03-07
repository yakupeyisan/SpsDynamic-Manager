// GroupBasedCafeteriaUsedCountReports form configuration (read-only report view)
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

export const formFields: TableColumn[] = [
  { field: 'CafeteriaGroupName', label: 'Kafeterya Grubu', text: 'Kafeterya Grubu', type: 'text' as ColumnType, fullWidth: true, disabled: true },
  { field: 'Day', label: 'Gün', text: 'Gün', type: 'date' as ColumnType, fullWidth: true, disabled: true },
  { field: 'DayName', label: 'Gün Adı', text: 'Gün Adı', type: 'text' as ColumnType, fullWidth: true, disabled: true },
  { field: 'NumberOfPass', label: 'Geçiş Sayısı', text: 'Geçiş Sayısı', type: 'int' as ColumnType, fullWidth: true, disabled: true },
];

export const formTabs: FormTab[] = [
  { label: 'Grup Bazlı Kafeterya Kullanım Bilgisi', fields: ['CafeteriaGroupName', 'Day', 'DayName', 'NumberOfPass'] },
];

export const formLoadUrl = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CafeteriaEvents/GroupBasedCafeteriaUsedCounts`;
export const formLoadRequest = (recid: any) => ({ recid });
export const formDataMapper = (apiRecord: any): any => apiRecord;
