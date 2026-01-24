// TaskSchedulers form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

const monthOptions = [
  { label: 'Ocak', value: '1' },
  { label: 'Şubat', value: '2' },
  { label: 'Mart', value: '3' },
  { label: 'Nisan', value: '4' },
  { label: 'Mayıs', value: '5' },
  { label: 'Haziran', value: '6' },
  { label: 'Temmuz', value: '7' },
  { label: 'Ağustos', value: '8' },
  { label: 'Eylül', value: '9' },
  { label: 'Ekim', value: '10' },
  { label: 'Kasım', value: '11' },
  { label: 'Aralık', value: '12' },
];

const dayOfMonthOptions = Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1), value: String(i + 1) })).concat([
  { label: 'SonGün', value: '-1' },
]);

export const formFields: TableColumn[] = [
  { field: 'Id', label: 'ID', text: 'ID', type: 'int' as ColumnType, disabled: true, showInAdd: false, fullWidth: true },

  { field: 'Name', label: 'Adı', text: 'Adı', type: 'text' as ColumnType, fullWidth: true },

  {
    field: 'RepeatType',
    label: 'Tekrar Tipi',
    text: 'Tekrar Tipi',
    type: 'list' as ColumnType,
    fullWidth: true,
    options: [
      { label: 'Günlük', value: 'Daily' },
      { label: 'Haftalık', value: 'Weekly' },
      { label: 'Aylık', value: 'Monthly' },
      { label: 'Bir Kez', value: 'OneTime' },
    ],
  },

  { field: 'EventDateTime', label: 'Tetiklenme Tarihi', text: 'Tetiklenme Tarihi', type: 'date' as ColumnType, disabled: true, fullWidth: true },
  { field: 'EventTime', label: 'Tetiklenme Saati', text: 'Tetiklenme Saati', type: 'time' as ColumnType, disabled: true, fullWidth: true },
  { field: 'PerDay', label: 'Günde Tekrar', text: 'Günde Tekrar', type: 'int' as ColumnType, disabled: true, fullWidth: true },

  { field: 'MonthOfYear', label: 'Yılın Ayları', text: 'Yılın Ayları', type: 'enum' as ColumnType, options: monthOptions, disabled: true, fullWidth: true },
  {
    field: 'MonthlyType',
    label: 'Aylık Türü',
    text: 'Aylık Türü',
    type: 'list' as ColumnType,
    disabled: true,
    fullWidth: true,
    options: [
      { label: 'Günler', value: 'Daily' },
      { label: 'Zaman', value: 'Time' },
    ],
  },

  { field: 'DayOfMonth', label: 'Ayın Günleri', text: 'Ayın Günleri', type: 'enum' as ColumnType, options: dayOfMonthOptions, disabled: true, fullWidth: true },
  {
    field: 'WeekOfMonth',
    label: 'Ayın Haftaları',
    text: 'Ayın Haftaları',
    type: 'enum' as ColumnType,
    disabled: true,
    fullWidth: true,
    options: [
      { label: 'Birinci Hafta', value: 1 },
      { label: 'İkinci Hafta', value: 2 },
      { label: 'Üçüncü Hafta', value: 3 },
      { label: 'Dördüncü Hafta', value: 4 },
      { label: 'Son Hafta', value: -1 },
    ],
  },
  {
    field: 'DayOfWeek',
    label: 'Haftanın Günleri',
    text: 'Haftanın Günleri',
    type: 'enum' as ColumnType,
    disabled: true,
    fullWidth: true,
    options: [
      { label: 'Pazartesi', value: 1 },
      { label: 'Salı', value: 2 },
      { label: 'Çarşamba', value: 3 },
      { label: 'Perşembe', value: 4 },
      { label: 'Cuma', value: 5 },
      { label: 'Cumartesi', value: 6 },
      { label: 'Pazar', value: 0 },
    ],
  },

  {
    field: 'Type',
    label: 'Tipi',
    text: 'Tipi',
    type: 'list' as ColumnType,
    fullWidth: true,
    options: [
      { label: 'Rapor', value: 'Report' },
      { label: 'Tetikleyici', value: 'Trigger' },
    ],
  },
  { field: 'Url', label: 'Url', text: 'Url', type: 'text' as ColumnType, disabled: true, fullWidth: true },
  {
    field: 'ReportTaskId',
    label: 'Rapor',
    text: 'Rapor',
    type: 'list' as ColumnType,
    disabled: true,
    fullWidth: true,
    load: {
      url: `${apiUrl}/api/ReportTasks`,
      injectAuth: true,
      method: 'POST' as const,
      data: { page: 1, limit: 1000, offset: 0, showDeleted: false, join: { Report: true } },
      map: (data: any) => {
        const records = Array.isArray(data?.records) ? data.records : [];
        return records
          .map((item: any) => ({
            id: item?.Id ?? item?.ID ?? item?.id,
            text: item?.Name ?? item?.name ?? String(item?.Id ?? item?.id ?? ''),
          }))
          .filter((x: any) => x.id != null);
      },
    },
  },

  { field: 'StartDate', label: 'Başlangıç Tarihi', text: 'Başlangıç Tarihi', type: 'date' as ColumnType, fullWidth: true },
  { field: 'EndDate', label: 'Bitiş Tarihi', text: 'Bitiş Tarihi', type: 'date' as ColumnType, fullWidth: true },
  { field: 'Email', label: 'Email', text: 'Email', type: 'text' as ColumnType, fullWidth: true },
];

export const formTabs: FormTab[] = [
  {
    label: 'Zamanlanmış Görev',
    fields: [
      'Id',
      'Name',
      'RepeatType',
      'EventDateTime',
      'EventTime',
      'PerDay',
      'MonthOfYear',
      'MonthlyType',
      'DayOfMonth',
      'WeekOfMonth',
      'DayOfWeek',
      'Type',
      'Url',
      'ReportTaskId',
      'StartDate',
      'EndDate',
      'Email',
    ],
  },
];

export const formLoadUrl = `${apiUrl}/api/TaskSchedulers/form`;

export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditTaskScheduler',
});

export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };

  const normalizeIdLike = (v: any) => {
    if (v == null) return v;
    if (typeof v === 'object') {
      if (v.id !== undefined) return v.id;
      if (v.ID !== undefined) return v.ID;
      if (v.Id !== undefined) return v.Id;
      if (v.value !== undefined) return v.value;
    }
    return v;
  };

  const normalizeDate = (v: any): string | any => {
    if (v == null || v === '') return v;
    const s = String(v).trim();
    if (!s) return '';
    // Accept: "YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ss", "YYYY-MM-DD HH:mm:ss"
    if (s.includes('T')) return s.split('T')[0];
    if (s.includes(' ')) return s.split(' ')[0];
    return s.length >= 10 ? s.slice(0, 10) : s;
  };

  const normalizeTime = (v: any): string | any => {
    if (v == null || v === '') return v;
    let s = String(v).trim();
    if (!s) return '';
    // Accept: "HH:mm", "HH:mm:ss", "YYYY-MM-DD HH:mm:ss", "YYYY-MM-DDTHH:mm:ss"
    if (s.includes('T')) s = s.split('T')[1] || s;
    if (s.includes(' ')) s = s.split(' ')[1] || s;
    // keep HH:mm
    return s.length >= 5 ? s.slice(0, 5) : s;
  };

  const normalizeEnumArray = (v: any): any => {
    if (v == null) return v;
    if (Array.isArray(v)) return v.map(normalizeIdLike);
    // sometimes backend returns comma-separated
    if (typeof v === 'string' && v.includes(',')) {
      return v.split(',').map((x) => x.trim()).filter(Boolean);
    }
    return v;
  };

  const normalizeToStringArray = (v: any): any => {
    const arr = normalizeEnumArray(v);
    if (arr == null) return arr;
    if (Array.isArray(arr)) return arr.map((x) => (x == null ? x : String(x)));
    return arr == null ? arr : String(arr);
  };

  const normalizeToNumberArray = (v: any): any => {
    const arr = normalizeEnumArray(v);
    if (arr == null) return arr;
    const toNum = (x: any) => {
      if (x == null || x === '') return x;
      const n = Number(x);
      return isNaN(n) ? x : n;
    };
    if (Array.isArray(arr)) return arr.map(toNum);
    return toNum(arr);
  };

  // Normalize list fields (select expects primitive value)
  formData.RepeatType = formData.RepeatType == null ? formData.RepeatType : String(normalizeIdLike(formData.RepeatType));
  formData.MonthlyType = formData.MonthlyType == null ? formData.MonthlyType : String(normalizeIdLike(formData.MonthlyType));
  formData.Type = formData.Type == null ? formData.Type : String(normalizeIdLike(formData.Type));

  // ReportTaskId options use numeric ids
  if (formData.ReportTaskId != null && formData.ReportTaskId !== '') {
    const n = Number(normalizeIdLike(formData.ReportTaskId));
    formData.ReportTaskId = isNaN(n) ? normalizeIdLike(formData.ReportTaskId) : n;
  }

  // Normalize enum/multi fields
  // MonthOfYear / DayOfMonth options are strings in config
  formData.MonthOfYear = normalizeToStringArray(formData.MonthOfYear);
  formData.DayOfMonth = normalizeToStringArray(formData.DayOfMonth);
  // WeekOfMonth / DayOfWeek options are numbers in config
  formData.WeekOfMonth = normalizeToNumberArray(formData.WeekOfMonth);
  formData.DayOfWeek = normalizeToNumberArray(formData.DayOfWeek);

  // Normalize date/time fields for native inputs
  formData.EventDateTime = normalizeDate(formData.EventDateTime);
  formData.StartDate = normalizeDate(formData.StartDate);
  formData.EndDate = normalizeDate(formData.EndDate);
  formData.EventTime = normalizeTime(formData.EventTime);

  // Normalize numeric fields
  if (formData.PerDay != null && formData.PerDay !== '') {
    const n = Number(normalizeIdLike(formData.PerDay));
    formData.PerDay = isNaN(n) ? formData.PerDay : n;
  }

  return formData;
};

