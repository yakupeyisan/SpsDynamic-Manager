// InputOutputReports form configuration
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

// Custom form fields for view form (read-only for reports)
export const formFields: TableColumn[] = [
  { 
    field: 'EventID', 
    label: 'Olay ID', 
    text: 'Olay ID', 
    type: 'int' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'EmployeeID', 
    label: 'Personel ID', 
    text: 'Personel ID', 
    type: 'int' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Date', 
    label: 'Tarih', 
    text: 'Tarih', 
    type: 'date' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Time', 
    label: 'Saat', 
    text: 'Saat', 
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
    field: 'TagCode', 
    label: 'Tag Kodu', 
    text: 'Tag Kodu', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'CardCode', 
    label: 'Kart Kodu', 
    text: 'Kart Kodu', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'FacilityCode', 
    label: 'Tesis Kodu', 
    text: 'Tesis Kodu', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'İlk Giriş/Son Çıkış Bilgileri', 
    fields: ['EventID', 'EmployeeID', 'Date', 'Time', 'inOUT', 'Location', 'TagCode', 'CardCode', 'FacilityCode'] 
  }
];

export const formLoadUrl = '';
export const formLoadRequest: ((recid: any, parentFormData?: any) => any) | undefined = undefined;
export const formDataMapper = (data: any) => data;
