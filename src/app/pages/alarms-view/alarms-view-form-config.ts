// AlarmsView (AlarmEvent) form configuration - read-only detail
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

export const formFields: TableColumn[] = [
  { field: 'AlarmEventID', label: 'ID', text: 'ID', type: 'int' as ColumnType, fullWidth: true, disabled: true },
  { field: 'AlarmTime', label: 'Alarm Zamanı', text: 'Alarm Zamanı', type: 'datetime' as ColumnType, fullWidth: true, disabled: true },
  { field: 'SourceType', label: 'Kaynak Tipi', text: 'Kaynak Tipi', type: 'text' as ColumnType, fullWidth: true, disabled: true },
  { field: 'SourceName', label: 'Kaynak Adı', text: 'Kaynak Adı', type: 'text' as ColumnType, fullWidth: true, disabled: true },
  { field: 'EmployeeID', label: 'Personel ID', text: 'Personel ID', type: 'int' as ColumnType, fullWidth: true, disabled: true },
  { field: 'Description', label: 'Açıklama', text: 'Açıklama', type: 'text' as ColumnType, fullWidth: true, disabled: true },
  { field: 'SoundFile', label: 'Ses Dosyası', text: 'Ses Dosyası', type: 'text' as ColumnType, fullWidth: true, disabled: true },
  { field: 'isPopUp', label: 'Popup', text: 'Popup', type: 'checkbox' as ColumnType, fullWidth: true, disabled: true },
  { field: 'ApprovedTime', label: 'Onay Zamanı', text: 'Onay Zamanı', type: 'datetime' as ColumnType, fullWidth: true, disabled: true },
  { field: 'ApprovedEmployeeID', label: 'Onaylayan ID', text: 'Onaylayan ID', type: 'int' as ColumnType, fullWidth: true, disabled: true },
  { field: 'ApprovedNote', label: 'Onay Notu', text: 'Onay Notu', type: 'textarea' as ColumnType, fullWidth: true, disabled: true }
];

export const formTabs: FormTab[] = [
  { label: 'Alarm Detayı', fields: ['AlarmEventID', 'AlarmTime', 'SourceType', 'SourceName', 'EmployeeID', 'Description', 'SoundFile', 'isPopUp', 'ApprovedTime', 'ApprovedEmployeeID', 'ApprovedNote'] }
];

export const formLoadUrl = `${apiUrl}/api/AlarmEvents/form`;
export const formLoadRequest = (recid: any) => ({ action: 'get', recid, name: 'EditAlarmEvent' });
export const formDataMapper = (apiRecord: any) => ({ ...apiRecord });
