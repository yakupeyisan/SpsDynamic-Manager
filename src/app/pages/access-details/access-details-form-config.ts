// AccessDetails form configuration
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

// Custom form fields for add/edit form (read-only for reports)
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
    field: 'IdentificationNumber', 
    label: 'TC Kimlik No', 
    text: 'TC Kimlik No', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Mail', 
    label: 'E-posta', 
    text: 'E-posta', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'MobilePhone1', 
    label: 'Cep Telefonu', 
    text: 'Cep Telefonu', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Banned', 
    label: 'Yasaklı', 
    text: 'Yasaklı', 
    type: 'checkbox' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'BannedMsg', 
    label: 'Yasak Mesajı', 
    text: 'Yasak Mesajı', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Scoring', 
    label: 'Puantaj', 
    text: 'Puantaj', 
    type: 'checkbox' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'WebClient', 
    label: 'Web İstemci', 
    text: 'Web İstemci', 
    type: 'checkbox' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'CafeteriaStatus', 
    label: 'Kafeterya Durumu', 
    text: 'Kafeterya Durumu', 
    type: 'checkbox' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'IsVisitor', 
    label: 'Ziyaretçi', 
    text: 'Ziyaretçi', 
    type: 'checkbox' as ColumnType,
    fullWidth: true,
    disabled: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Personel Bilgileri', 
    fields: ['EmployeeID', 'Name', 'SurName', 'IdentificationNumber', 'Mail', 'MobilePhone1', 'Banned', 'BannedMsg', 'Scoring', 'WebClient', 'CafeteriaStatus', 'IsVisitor'] 
  }
];

export const formLoadUrl = '';
export const formLoadRequest: ((recid: any, parentFormData?: any) => any) | undefined = undefined;
export const formDataMapper = (data: any) => data;
