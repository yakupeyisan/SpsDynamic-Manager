// SubscriptionEvents form configuration (read-only report view)
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

export const formFields: TableColumn[] = [
  { field: 'SubscriptionEventsID', label: 'ID', text: 'ID', type: 'int' as ColumnType, fullWidth: true, disabled: true },
  { field: 'FullName', label: 'Ad Soyad', text: 'Ad Soyad', type: 'text' as ColumnType, fullWidth: true, disabled: true },
  { field: 'TagCode', label: 'Tag Kodu', text: 'Tag Kodu', type: 'text' as ColumnType, fullWidth: true, disabled: true },
  { field: 'PackageID', label: 'Paket ID', text: 'Paket ID', type: 'int' as ColumnType, fullWidth: true, disabled: true },
  { field: 'ApplicationID', label: 'Uygulama ID', text: 'Uygulama ID', type: 'int' as ColumnType, fullWidth: true, disabled: true },
  { field: 'CafeteriaEventID', label: 'Kafeterya Olay ID', text: 'Kafeterya Olay ID', type: 'int' as ColumnType, fullWidth: true, disabled: true },
  { field: 'Day', label: 'Gün', text: 'Gün', type: 'date' as ColumnType, fullWidth: true, disabled: true },
  { field: 'isUsed', label: 'Kullanıldı mı', text: 'Kullanıldı mı', type: 'checkbox' as ColumnType, fullWidth: true, disabled: true },
  { field: 'AccessZoneId', label: 'Erişim Bölgesi ID', text: 'Erişim Bölgesi ID', type: 'int' as ColumnType, fullWidth: true, disabled: true },
  { field: 'CreatedAt', label: 'Oluşturma Tarihi', text: 'Oluşturma Tarihi', type: 'datetime' as ColumnType, fullWidth: true, disabled: true },
  { field: 'Operator', label: 'Operatör', text: 'Operatör', type: 'text' as ColumnType, fullWidth: true, disabled: true }
];

export const formTabs: FormTab[] = [
  { label: 'Abone Kayıt Bilgileri', fields: ['SubscriptionEventsID', 'FullName', 'TagCode', 'PackageID', 'ApplicationID', 'CafeteriaEventID', 'Day', 'isUsed', 'AccessZoneId', 'CreatedAt', 'Operator'] }
];

export const formLoadUrl = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/SubscriptionEvents`;
export const formLoadRequest = (recid: any) => ({ recid });
export const formDataMapper = (apiRecord: any): any => apiRecord;
