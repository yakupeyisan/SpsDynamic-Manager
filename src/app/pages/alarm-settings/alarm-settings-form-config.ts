// AlarmSettings form configuration (Alarms entity)
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Kaynak Tipi: DOOR->Kapı, INPUT->Input, OUTPUT->Output, READER->Okuyucu
const sourceTypeOptions = [
  { label: 'Kapı', value: 'DOOR' },
  { label: 'Input', value: 'INPUT' },
  { label: 'Output', value: 'OUTPUT' },
  { label: 'Okuyucu', value: 'READER' }
];

// SourceType değerine göre API URL
function getSourceListUrl(sourceType: string): string {
  const base = `${apiUrl}/api/Terminals`;
  switch (sourceType) {
    case 'DOOR': return `${base}/GetAllDoors`;
    case 'INPUT': return `${base}/GetAllInputs`;
    case 'OUTPUT': return `${base}/GetAllOutputs`;
    case 'READER': return `${base}/GetAllReaders`;
    default: return '';
  }
}

// Personel kapsamı: Tüm Kişiler | Özel
const employeeScopeOptions = [
  { label: 'Tüm Kişiler', value: 'ALL' },
  { label: 'Özel', value: 'SPECIFIC' }
];

// Olay sonucu: true->Başarılı, false->Başarısız
const eventResultOptions = [
  { label: 'Başarılı', value: 'true' },
  { label: 'Başarısız', value: 'false' }
];

export const formFields: TableColumn[] = [
  {
    field: 'AlarmID',
    label: 'ID',
    text: 'ID',
    type: 'int' as ColumnType,
    fullWidth: false,
    disabled: true,
    showInAdd: false,
    showInUpdate: true
  },
  {
    field: 'SourceType',
    label: 'Kaynak Tipi',
    text: 'Kaynak Tipi',
    type: 'list' as ColumnType,
    fullWidth: true,
    options: sourceTypeOptions
  },
  {
    field: 'SourceID',
    label: 'Kaynak',
    text: 'Kaynak',
    type: 'list' as ColumnType,
    fullWidth: true,
    load: {
      url: (formData?: any) => getSourceListUrl(formData?.SourceType || ''),
      method: 'POST',
      data: (formData?: any) => ({}),
      map: (response: any) => {
        // API: { status, message, data: [{ SerialNumber, Name }, ...] } veya { records: [...] }
        const records = response?.data ?? response?.records ?? (Array.isArray(response) ? response : []);
        return (records || []).map((item: any) => {
          const id = item.SerialNumber ?? item.ReaderID ?? item.DoorID ?? item.id ?? item.ID ?? item.Id ?? item.recid ?? null;
          const text = item.Name ?? item.ReaderName ?? item.DoorName ?? item.name ?? item.text ?? (id != null ? String(id) : '');
          return { id, text };
        });
      }
    }
  },
  {
    field: 'EmployeeScope',
    label: 'Personel Kapsamı',
    text: 'Personel Kapsamı',
    type: 'list' as ColumnType,
    fullWidth: true,
    options: employeeScopeOptions,
    // Sadece READER seçiliyken göster (formda gizleme showInAdd/showInUpdate ile yapılamaz, *ngIf component'te; burada sadece disabled)
    disabled: (formData: any) => formData?.SourceType !== 'READER'
  },
  {
    field: 'EmployeeID',
    label: 'Personel',
    text: 'Personel',
    type: 'list' as ColumnType,
    fullWidth: true,
    disabled: (formData: any) =>
      formData?.SourceType !== 'READER' || formData?.EmployeeScope === 'ALL'
    // Options come from parent formFieldSearch (Personel ara... with /api/Employees/find)
  },
  {
    field: 'EventResult',
    label: 'Olay Sonucu',
    text: 'Olay Sonucu',
    type: 'list' as ColumnType,
    fullWidth: true,
    options: eventResultOptions
  },
  {
    field: 'Description',
    label: 'Açıklama',
    text: 'Açıklama',
    type: 'textarea' as ColumnType,
    fullWidth: true
  },
  {
    field: 'SoundFile',
    label: 'Ses Dosyası',
    text: 'Ses Dosyası',
    type: 'list' as ColumnType,
    fullWidth: true,
    load: {
      url: `${apiUrl}/api/SoundFiles`,
      method: 'POST',
      data: { limit: -1, offset: 0, page: 1 },
      map: (response: any) => {
        const records = response?.records ?? response?.data ?? (Array.isArray(response) ? response : []);
        return (records || []).map((item: any) => {
          const name = item.Name ?? item.name ?? item.Url ?? item.url ?? '';
          return { id: name, text: name || '(boş)' };
        });
      }
    }
  },
  {
    field: 'isPopUp',
    label: 'Popup Göster',
    text: 'Popup Göster',
    type: 'list' as ColumnType,
    fullWidth: false,
    options: [
      { label: 'Aktif', value: true },
      { label: 'Pasif', value: false }
    ]
  },
  {
    field: 'TimeZoneID',
    label: 'Zaman Dilimi',
    text: 'Zaman Dilimi',
    type: 'list' as ColumnType,
    fullWidth: true,
    load: {
      url: `${apiUrl}/api/TimeZones`,
      method: 'POST',
      data: { page: 1, limit: 2000, offset: 0, columns: [{ field: 'TimeZoneID' }, { field: 'TimeZoneName' }] },
      map: (response: any) => {
        const records = response?.records ?? response?.data ?? (Array.isArray(response) ? response : []);
        return (records || []).map((item: any) => ({
          id: item.TimeZoneID ?? item.Id ?? item.id,
          text: item.TimeZoneName ?? item.Name ?? item.text ?? String(item.TimeZoneID ?? item.Id ?? item.id ?? '')
        }));
      }
    }
  },
  {
    field: 'SchedulerTaskId',
    label: 'Görev',
    text: 'Görev',
    type: 'list' as ColumnType,
    fullWidth: true,
    load: {
      url: `${apiUrl}/api/TaskSchedulers`,
      method: 'POST',
      map: (response: any) => {
        const list = Array.isArray(response) ? response : (response?.list ?? response?.records ?? []);
        return (list || []).map((item: any) => ({
          id: item?.Id ?? item?.ID ?? item?.id ?? item?.recid,
          text: item?.Name ?? item?.name ?? String(item?.Id ?? item?.id ?? item?.recid ?? '')
        })).filter((x: any) => x.id != null);
      }
    }
  }
];

export const formTabs: FormTab[] = [
  {
    label: 'Alarm Bilgileri',
    fields: ['AlarmID', 'SourceType', 'SourceID', 'EmployeeScope', 'EmployeeID', 'EventResult', 'Description', 'SoundFile', 'isPopUp', 'TimeZoneID', 'SchedulerTaskId']
  }
];

export const formLoadUrl = `${apiUrl}/api/Alarms/form`;

export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditAlarm'
});

export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  // Nested objeleri form verisinden çıkar (kaydetmede gönderilmez)
  delete formData.Employee;
  delete formData.TimeZone;
  delete formData.TaskScheduler;
  // EventResult: backend "1"/"0" veya boolean gelebilir; select için "true"/"false"
  if (formData.EventResult === 1 || formData.EventResult === '1') {
    formData.EventResult = 'true';
  } else if (formData.EventResult === 0 || formData.EventResult === '0') {
    formData.EventResult = 'false';
  } else if (typeof formData.EventResult === 'boolean') {
    formData.EventResult = formData.EventResult ? 'true' : 'false';
  }
  // EmployeeScope yoksa varsayılan
  if (formData.EmployeeScope == null && formData.SourceType === 'READER') {
    formData.EmployeeScope = formData.EmployeeID != null && formData.EmployeeID !== '' ? 'SPECIFIC' : 'ALL';
  }
  // SchedulerTaskId: nullable int (number | null)
  if (formData.SchedulerTaskId != null && formData.SchedulerTaskId !== '') {
    const n = Number(formData.SchedulerTaskId);
    formData.SchedulerTaskId = isNaN(n) ? null : n;
  } else {
    formData.SchedulerTaskId = null;
  }
  return formData;
};
