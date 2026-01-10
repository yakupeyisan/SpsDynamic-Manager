// SmsTransactions form configuration
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

// Custom form fields for add/edit form (read-only for reports)
export const formFields: TableColumn[] = [
  { 
    field: 'Type', 
    label: 'Tip', 
    text: 'Tip', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Number', 
    label: 'Telefon Numarası', 
    text: 'Telefon Numarası', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Message', 
    label: 'Mesaj', 
    text: 'Mesaj', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Result', 
    label: 'Sonuç', 
    text: 'Sonuç', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'IsSend', 
    label: 'Gönderildi', 
    text: 'Gönderildi', 
    type: 'checkbox' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'SendDate', 
    label: 'Gönderim Tarihi', 
    text: 'Gönderim Tarihi', 
    type: 'datetime' as ColumnType,
    fullWidth: true,
    disabled: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'SMS İşlem Bilgileri', 
    fields: ['Type', 'Number', 'Message', 'Result', 'IsSend', 'SendDate'] 
  }
];

export const formLoadUrl = '';
export const formLoadRequest: ((recid: any, parentFormData?: any) => any) | undefined = undefined;
export const formDataMapper = (data: any) => data;
