// InsideOutsideReports form configuration
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

// Custom form fields for view form (read-only for reports)
export const formFields: TableColumn[] = [
  { 
    field: 'EmployeeID', 
    label: 'Personel ID', 
    text: 'Personel ID', 
    type: 'int' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'IdentificationNumber', 
    label: 'TC Kimlik', 
    text: 'TC Kimlik', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Name', 
    label: 'Ad', 
    text: 'Ad', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'SurName', 
    label: 'Soyad', 
    text: 'Soyad', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'EmployeeLastAccessEvent.inOUT', 
    label: 'Durum', 
    text: 'Durum', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true,
    render: (record: any) => {
      const lastEvent = record['EmployeeLastAccessEvent'];
      if (!lastEvent) return '';
      const inOut = lastEvent['inOUT'];
      if (inOut === '0' || inOut === 0) {
        return 'İçerde';
      } else if (inOut === '1' || inOut === 1) {
        return 'Dışarıda';
      }
      return '';
    }
  },
  { 
    field: 'EmployeeLastAccessEvent.EventTime', 
    label: 'Son Geçiş Zamanı', 
    text: 'Son Geçiş Zamanı', 
    type: 'datetime' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'EmployeeLastAccessEvent.Location', 
    label: 'Son Geçiş Konumu', 
    text: 'Son Geçiş Konumu', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'İçeridekiler/Dışarıdakiler Bilgileri', 
    fields: ['EmployeeID', 'IdentificationNumber', 'Name', 'SurName', 'EmployeeLastAccessEvent.inOUT', 'EmployeeLastAccessEvent.EventTime', 'EmployeeLastAccessEvent.Location'] 
  }
];

export const formLoadUrl = '';
export const formLoadRequest: ((recid: any, parentFormData?: any) => any) | undefined = undefined;
export const formDataMapper = (data: any) => data;
