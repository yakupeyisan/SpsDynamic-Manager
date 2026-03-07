// SubscriptionPackages table columns configuration
import { TableColumn, ColumnType } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Haftanın günleri: 0=Pazar, 1=Pazartesi, 2=Salı, 3=Çarşamba, 4=Perşembe, 5=Cuma, 6=Cumartesi
const DAY_NAMES: Record<number, string> = {
  0: 'Pazar',
  1: 'Pazartesi',
  2: 'Salı',
  3: 'Çarşamba',
  4: 'Perşembe',
  5: 'Cuma',
  6: 'Cumartesi'
};

function renderDayOfWeek(record: any, _index: number, column: TableColumn): string {
  const fieldName = column?.field || 'DayOfWeek';
  const raw = record?.[fieldName] ?? record?.DayOfWeek ?? record?.dayOfWeek;
  if (raw == null || raw === '') return '';
  let arr: any[];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (typeof raw === 'string') {
    const s = raw.trim();
    if (s.startsWith('[')) {
      try {
        arr = JSON.parse(s) as any[];
      } catch {
        arr = s ? s.split(',').map((x: string) => x.trim()) : [];
      }
    } else {
      arr = s ? s.split(',').map((x: string) => x.trim()) : [s];
    }
  } else {
    arr = [raw];
  }
  const toDayNum = (n: number): number =>
    (n === 7 ? 0 : n);
  const names = arr
    .map((v: any) => (typeof v === 'string' ? parseInt(v, 10) : Number(v)))
    .filter((n: number) => !Number.isNaN(n) && n >= 0 && n <= 7)
    .map((n: number) => toDayNum(n))
    .filter((n: number) => n >= 0 && n <= 6)
    .sort((a, b) => a - b)
    .map((n: number) => DAY_NAMES[n] ?? '')
    .filter(Boolean);
  return names.join(', ') || '';
}

// Durum: 0 = Pasif, 1 = Aktif
function renderStatus(record: any, _index: number, column: TableColumn): string {
  const v = record?.[column?.field ?? 'Status'];
  if (v == null || v === '') return '';
  const n = typeof v === 'string' ? parseInt(v, 10) : Number(v);
  return n === 1 ? 'Aktif' : 'Pasif';
}

// Başlangıç Kuralı: 0 = Ön Tanımlı, 1 = Esnek
function renderStartRule(record: any, _index: number, column: TableColumn): string {
  const v = record?.[column?.field ?? 'StartRule'];
  if (v == null || v === '') return '';
  const n = typeof v === 'string' ? parseInt(v, 10) : Number(v);
  return n === 1 ? 'Esnek' : 'Ön Tanımlı';
}

// Başlangıç Günü: sayı -> gün adı (form ile aynı: 0 Pazar, 1 Pazartesi, ... 6 Cumartesi)
function renderStartDay(record: any, _index: number, column: TableColumn): string {
  const v = record?.[column?.field ?? 'StartDay'];
  if (v == null || v === '') return '';
  const n = typeof v === 'string' ? parseInt(v, 10) : Number(v);
  if (Number.isNaN(n) || n < 0 || n > 6) return String(v);
  return DAY_NAMES[n] ?? '';
}

export const tableColumns: TableColumn[] = [
  { 
    field: 'Id', 
    label: 'ID', 
    text: 'ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'ProjectID', 
    label: 'Proje ID', 
    text: 'Proje ID',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'ApplicationID',
    label: 'Zaman Dilimi',
    text: 'Zaman Dilimi',
    type: 'enum' as ColumnType,
    sortable: false,
    width: '200px',
    size: '200px',
    searchable: 'enum' as ColumnType,
    resizable: true,
    render: (record: any) =>
      record?.CafeteriaApplication?.ApplicationName ??
      record?.Application?.Name ??
      record?.Application?.ApplicationName ??
      '',
    joinTable: 'Application',
    load: {
      url: `${apiUrl}/api/CafeteriaApplications`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        if (!data?.records || !Array.isArray(data.records)) return [];
        return data.records.map((item: any) => ({
          label: item.Name ?? item.ApplicationName ?? `ID: ${item.Id ?? item.CafeteriaApplicationID}`,
          value: item.Id ?? item.CafeteriaApplicationID ?? item.ApplicationID
        }));
      }
    }
  },
  { 
    field: 'Name', 
    label: 'Paket Adı', 
    text: 'Paket Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '250px', 
    size: '250px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'DayOfWeek', 
    label: 'Haftanın Günü', 
    text: 'Haftanın Günü',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true,
    render: renderDayOfWeek
  },
  { 
    field: 'HowManyDays', 
    label: 'Kaç Gün', 
    text: 'Kaç Gün',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'Holiday', 
    label: 'Tatil', 
    text: 'Tatil',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'Amount', 
    label: 'Tutar', 
    text: 'Tutar',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'float',
    resizable: true
  },
  { 
    field: 'MinDay', 
    label: 'Minimum Gün', 
    text: 'Minimum Gün',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'Status', 
    label: 'Durum', 
    text: 'Durum',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'text',
    resizable: true,
    render: renderStatus
  },
  { 
    field: 'StartRule', 
    label: 'Başlangıç Kuralı', 
    text: 'Başlangıç Kuralı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true,
    render: renderStartRule
  },
  { 
    field: 'StartDay', 
    label: 'Başlangıç Günü', 
    text: 'Başlangıç Günü',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '130px', 
    size: '130px',
    searchable: 'int',
    resizable: true,
    render: renderStartDay
  },
  { 
    field: 'MinOrderDay', 
    label: 'En Son Sipariş Günü', 
    text: 'En Son Sipariş Günü',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '140px', 
    size: '140px',
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'IsSelectable', 
    label: 'Seçilebilir', 
    text: 'Seçilebilir',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'Description', 
    label: 'Açıklama', 
    text: 'Açıklama',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '250px', 
    size: '250px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'ApplicationID', 
    label: 'Uygulama ID', 
    text: 'Uygulama ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'int',
    resizable: true,
    joinTable: 'Application'
  },
  { 
    field: 'CreatedAt', 
    label: 'Oluşturma Tarihi', 
    text: 'Oluşturma Tarihi',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '180px', 
    size: '180px',
    searchable: 'datetime',
    resizable: true
  },
  { 
    field: 'UpdatedAt', 
    label: 'Güncelleme Tarihi', 
    text: 'Güncelleme Tarihi',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '180px', 
    size: '180px',
    searchable: 'datetime',
    resizable: true
  }
];
