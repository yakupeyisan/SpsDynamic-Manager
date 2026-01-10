// EmployeeTransferList form configuration
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

// Custom form fields for add/edit form (read-only for reports)
export const formFields: TableColumn[] = [
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
    field: 'Gender', 
    label: 'Cinsiyet', 
    text: 'Cinsiyet', 
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
    field: 'Address', 
    label: 'Adres', 
    text: 'Adres', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'City', 
    label: 'Şehir', 
    text: 'Şehir', 
    type: 'text' as ColumnType,
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
    field: 'WebAdmin', 
    label: 'Web Admin', 
    text: 'Web Admin', 
    type: 'checkbox' as ColumnType,
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
    field: 'CafeteriaStatus', 
    label: 'Kafeterya Durumu', 
    text: 'Kafeterya Durumu', 
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
  },
  { 
    field: 'Plate', 
    label: 'Plaka', 
    text: 'Plaka', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'CardUID', 
    label: 'Kart UID', 
    text: 'Kart UID', 
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
    field: 'CardCodeType', 
    label: 'Kart Kodu Tipi', 
    text: 'Kart Kodu Tipi', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Status', 
    label: 'Durum', 
    text: 'Durum', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'isDelete', 
    label: 'Silindi', 
    text: 'Silindi', 
    type: 'checkbox' as ColumnType,
    fullWidth: true,
    disabled: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Genel Bilgiler', 
    fields: ['IdentificationNumber', 'Name', 'SurName', 'Gender', 'Mail', 'MobilePhone1', 'Address', 'City'] 
  },
  { 
    label: 'Durum Bilgileri', 
    fields: ['WebClient', 'WebAdmin', 'Banned', 'BannedMsg', 'CafeteriaStatus', 'Status', 'isDelete'] 
  },
  { 
    label: 'Kart Bilgileri', 
    fields: ['FacilityCode', 'Plate', 'CardUID', 'CardCode', 'CardCodeType'] 
  }
];

export const formLoadUrl = '';
export const formLoadRequest: ((recid: any, parentFormData?: any) => any) | undefined = undefined;
export const formDataMapper = (data: any) => data;
