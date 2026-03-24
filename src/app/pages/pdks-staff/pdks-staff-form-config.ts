// PdksStaff (Kadro) form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

const TIME_FIELDS = [
  'MondayStartTime',
  'MondayEndTime',
  'TuesdayStartTime',
  'TuesdayEndTime',
  'WednesdayStartTime',
  'WednesdayEndTime',
  'ThursdayStartTime',
  'ThursdayEndTime',
  'FridayStartTime',
  'FridayEndTime',
  'SaturdayStartTime',
  'SaturdayEndTime',
  'SundayStartTime',
  'SundayEndTime'
] as const;

/** SQL / ISO time strings → HTML time input (HH:mm) */
function normalizeTimeForInput(v: unknown): string | null {
  if (v == null || v === '') return null;
  const s = String(v).trim();
  const m = s.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  const hh = m[1].padStart(2, '0');
  const mm = m[2];
  return `${hh}:${mm}`;
}

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  {
    field: 'Name',
    label: 'Kadro Adı',
    text: 'Kadro Adı',
    type: 'text' as ColumnType,
    fullWidth: true
  },
  {
    field: 'ProjectID',
    label: 'Proje ID',
    text: 'Proje ID',
    type: 'int' as ColumnType,
    fullWidth: true
  },
  { field: 'MondayStartTime', label: 'Pazartesi Başlangıç', text: 'Pazartesi Başlangıç', type: 'time' as ColumnType },
  { field: 'MondayEndTime', label: 'Pazartesi Bitiş', text: 'Pazartesi Bitiş', type: 'time' as ColumnType },
  { field: 'TuesdayStartTime', label: 'Salı Başlangıç', text: 'Salı Başlangıç', type: 'time' as ColumnType },
  { field: 'TuesdayEndTime', label: 'Salı Bitiş', text: 'Salı Bitiş', type: 'time' as ColumnType },
  { field: 'WednesdayStartTime', label: 'Çarşamba Başlangıç', text: 'Çarşamba Başlangıç', type: 'time' as ColumnType },
  { field: 'WednesdayEndTime', label: 'Çarşamba Bitiş', text: 'Çarşamba Bitiş', type: 'time' as ColumnType },
  { field: 'ThursdayStartTime', label: 'Perşembe Başlangıç', text: 'Perşembe Başlangıç', type: 'time' as ColumnType },
  { field: 'ThursdayEndTime', label: 'Perşembe Bitiş', text: 'Perşembe Bitiş', type: 'time' as ColumnType },
  { field: 'FridayStartTime', label: 'Cuma Başlangıç', text: 'Cuma Başlangıç', type: 'time' as ColumnType },
  { field: 'FridayEndTime', label: 'Cuma Bitiş', text: 'Cuma Bitiş', type: 'time' as ColumnType },
  { field: 'SaturdayStartTime', label: 'Cumartesi Başlangıç', text: 'Cumartesi Başlangıç', type: 'time' as ColumnType },
  { field: 'SaturdayEndTime', label: 'Cumartesi Bitiş', text: 'Cumartesi Bitiş', type: 'time' as ColumnType },
  { field: 'SundayStartTime', label: 'Pazar Başlangıç', text: 'Pazar Başlangıç', type: 'time' as ColumnType },
  { field: 'SundayEndTime', label: 'Pazar Bitiş', text: 'Pazar Bitiş', type: 'time' as ColumnType }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  {
    label: 'Kadro Bilgileri',
    fields: ['Name', 'ProjectID']
  },
  {
    label: 'Haftalık Çalışma Saatleri',
    fields: [...TIME_FIELDS]
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/PdksStaffs/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditPdksStaff'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  for (const f of TIME_FIELDS) {
    formData[f] = normalizeTimeForInput(apiRecord[f]);
  }
  if (formData.ProjectID != null && formData.ProjectID !== '') {
    formData.ProjectID = Number(formData.ProjectID);
  }
  return formData;
};
