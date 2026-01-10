// AccessEvents form configuration
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

// Custom form fields for add/edit form (read-only for reports)
export const formFields: TableColumn[] = [
  { 
    field: 'AccessEventID', 
    label: 'Olay ID', 
    text: 'Olay ID', 
    type: 'int' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'TagCode', 
    label: 'Tag Kodu', 
    text: 'Tag Kodu', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'inOUT', 
    label: 'Yön', 
    text: 'Yön', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Location', 
    label: 'Konum', 
    text: 'Konum', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'DeviceSerial', 
    label: 'Cihaz Seri No', 
    text: 'Cihaz Seri No', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'EventType', 
    label: 'Olay Tipi', 
    text: 'Olay Tipi', 
    type: 'checkbox' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'EventDesc', 
    label: 'Olay Açıklaması', 
    text: 'Olay Açıklaması', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'EventTime', 
    label: 'Olay Zamanı', 
    text: 'Olay Zamanı', 
    type: 'datetime' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'RecordTime', 
    label: 'Kayıt Zamanı', 
    text: 'Kayıt Zamanı', 
    type: 'datetime' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'EventSource', 
    label: 'Olay Kaynağı', 
    text: 'Olay Kaynağı', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'isOffline', 
    label: 'Offline', 
    text: 'Offline', 
    type: 'checkbox' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'isPdks', 
    label: 'Puantaj', 
    text: 'Puantaj', 
    type: 'checkbox' as ColumnType,
    fullWidth: true,
    disabled: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Geçiş Kayıt Bilgileri', 
    fields: ['AccessEventID', 'TagCode', 'inOUT', 'Location', 'DeviceSerial', 'EventType', 'EventDesc', 'EventTime', 'RecordTime', 'EventSource', 'isOffline', 'isPdks'] 
  }
];

export const formLoadUrl = '';
export const formLoadRequest: ((recid: any, parentFormData?: any) => any) | undefined = undefined;
export const formDataMapper = (data: any) => data;
