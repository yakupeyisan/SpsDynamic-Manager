// SubscriptionPackages form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Custom form fields for add/edit form (adapted from legacy EditSubscriptionPackage w2ui form)
export const formFields: TableColumn[] = [
  {
    field: 'Id',
    label: 'ID',
    text: 'ID',
    type: 'int' as ColumnType,
    fullWidth: false,
    disabled: true,
    showInAdd: false,
    showInUpdate: true
  },
  {
    field: 'ApplicationID',
    label: 'Zaman Dilimi',
    text: 'Zaman Dilimi',
    type: 'list',
    load: {
      url: `${apiUrl}/api/CafeteriaApplications`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.Id || item.ApplicationID,
          text: item.Name || item.ApplicationName || `ID: ${item.Id || item.ApplicationID}`
        }));
      }
    }
  },
  {
    field: 'Name',
    label: 'Adi',
    text: 'Adi',
    type: 'text' as ColumnType,
    fullWidth: true
  },
  {
    field: 'DayOfWeek',
    label: 'Haftanın Günleri',
    text: 'Haftanın Günleri',
    type: 'enum' as ColumnType,
    fullWidth: false,
    options: [
      { label: 'Pazartesi', value: 1 },
      { label: 'Salı', value: 2 },
      { label: 'Çarşamba', value: 3 },
      { label: 'Perşembe', value: 4 },
      { label: 'Cuma', value: 5 },
      { label: 'Cumartesi', value: 6 },
      { label: 'Pazar', value: 0 }
    ]
  },
  {
    field: 'HowManyDays',
    label: 'Gün Sayısı',
    text: 'Gün Sayısı',
    type: 'int' as ColumnType,
    fullWidth: false
  },
  {
    field: 'Holiday',
    label: 'Tatiller Geçerli mi?',
    text: 'Tatiller Geçerli mi?',
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  {
    field: 'Amount',
    label: 'Tutar',
    text: 'Tutar',
    type: 'float' as ColumnType,
    fullWidth: false
  },
  {
    field: 'MinDay',
    label: 'Minimum Seçilebilir Gün Sayısı',
    text: 'Minimum Seçilebilir Gün Sayısı',
    type: 'int' as ColumnType,
    fullWidth: false
  },
  {
    field: 'Status',
    label: 'Durum',
    text: 'Durum',
    type: 'list' as ColumnType,
    fullWidth: false,
    options: [
      { label: 'Pasif', value: 0 },
      { label: 'Aktif', value: 1 }
    ]
  },
  {
    field: 'StartRule',
    label: 'Başlangıç Kuralı',
    text: 'Başlangıç Kuralı',
    type: 'radio' as ColumnType,
    fullWidth: false,
    options: [
      { label: 'Ön Tanımlı', value: 0 },
      { label: 'Esnek', value: 1 }
    ]
  },
  {
    field: 'StartDay',
    label: 'Başlangıç Günü',
    text: 'Başlangıç Günü',
    type: 'list' as ColumnType,
    fullWidth: false,
    options: [
      { label: 'Pazar', value: 0 },
      { label: 'Pazartesi', value: 1 },
      { label: 'Salı', value: 2 },
      { label: 'Çarşamba', value: 3 },
      { label: 'Perşembe', value: 4 },
      { label: 'Cuma', value: 5 },
      { label: 'Cumartesi', value: 6 }
    ],
    disabled: (formData?: any) => formData && Number(formData.StartRule) === 1
  },
  {
    field: 'MinOrderDay',
    label: 'En Son Sipariş Günü',
    text: 'En Son Sipariş Günü',
    type: 'int' as ColumnType,
    fullWidth: false,
    disabled: (formData?: any) => formData && Number(formData.StartRule) === 1
  },
  {
    field: 'IsSelectable',
    label: 'En yakın tarihteki paketi otomatik seç',
    text: 'En yakın tarihteki paketi otomatik seç',
    type: 'checkbox' as ColumnType,
    fullWidth: false,
    disabled: (formData?: any) => formData && Number(formData.StartRule) === 1
  },
  {
    field: 'Description',
    label: 'Açıklama',
    text: 'Açıklama',
    type: 'textarea' as ColumnType,
    fullWidth: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  {
    label: 'Paket Bilgileri',
    fields: [
      'Id',
      'ApplicationID',
      'Name',
      'DayOfWeek',
      'HowManyDays',
      'Holiday',
      'Amount',
      'MinDay',
      'Status',
      'StartRule',
      'StartDay',
      'MinOrderDay',
      'IsSelectable',
      'Description'
    ]
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/SubscriptionPackages/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditSubscriptionPackage'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  // API bazen { record: { Id, ApplicationID, ... } } döndürüyor; asıl veriyi kullan
  const record = apiRecord?.record && typeof apiRecord.record === 'object'
    ? apiRecord.record
    : apiRecord;
  const formData: any = { ...record };

  // Map nested Application object to ApplicationID field
  const app = record?.Application ?? apiRecord?.Application;
  if (app && (app.Id != null || app.ApplicationID != null)) {
    formData['ApplicationID'] = app.Id ?? app.ApplicationID;
  }

  // DayOfWeek: API'den gelen dizi (string veya number) form select için sayı dizisine çevir (0-6; 7 -> 0 Pazar)
  const rawDayOfWeek =
    record?.DayOfWeek ??
    record?.dayOfWeek ??
    apiRecord?.DayOfWeek ??
    apiRecord?.dayOfWeek;
  if (rawDayOfWeek != null && rawDayOfWeek !== '') {
    let arr: any[];
    if (Array.isArray(rawDayOfWeek)) {
      arr = rawDayOfWeek;
    } else if (typeof rawDayOfWeek === 'string') {
      const s = rawDayOfWeek.trim();
      if (s.startsWith('[')) {
        try {
          arr = JSON.parse(s) as any[];
        } catch {
          arr = s ? s.split(',').map((x: string) => x.trim()) : [];
        }
      } else {
        arr = s ? s.split(',').map((x: string) => x.trim()) : [];
      }
    } else {
      arr = [rawDayOfWeek];
    }
    formData['DayOfWeek'] = arr
      .map((v: any) => (typeof v === 'string' ? parseInt(v, 10) : Number(v)))
      .filter((n: number) => !Number.isNaN(n) && n >= 0 && n <= 7)
      .map((n: number) => (n === 7 ? 0 : n));
  } else {
    formData['DayOfWeek'] = [];
  }

  // MinDay, Status, StartRule, StartDay: sayıya çevir; list/radio için yoksa 0 (seçim boş kalmasın)
  const num = (v: any): number | null => {
    if (v == null || v === '') return null;
    const n = typeof v === 'string' ? parseInt(v, 10) : Number(v);
    return Number.isNaN(n) ? null : n;
  };
  const minDayVal = num(formData['MinDay'] ?? record?.MinDay ?? record?.minDay);
  const statusVal = num(formData['Status'] ?? record?.Status ?? record?.status);
  const startRuleVal = num(formData['StartRule'] ?? record?.StartRule ?? record?.startRule);
  const startDayVal = num(formData['StartDay'] ?? record?.StartDay ?? record?.startDay);
  if (minDayVal != null) formData['MinDay'] = minDayVal;
  formData['Status'] = statusVal ?? 0;
  formData['StartRule'] = startRuleVal ?? 0;
  formData['StartDay'] = startDayVal ?? 0;

  return formData;
};
