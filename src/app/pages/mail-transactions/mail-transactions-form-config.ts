// MailTransactions form configuration
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

// Custom form fields for add/edit form (read-only for reports)
export const formFields: TableColumn[] = [
  { 
    field: 'MailAdress', 
    label: 'E-Mail Adresi', 
    text: 'E-Mail Adresi', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Title', 
    label: 'Konu', 
    text: 'Konu', 
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
    field: 'IsSend', 
    label: 'Gönderildi', 
    text: 'Gönderildi', 
    type: 'checkbox' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'IsBulk', 
    label: 'Toplu Mail', 
    text: 'Toplu Mail', 
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
  },
  { 
    field: 'Response', 
    label: 'Yanıt', 
    text: 'Yanıt', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Attachments', 
    label: 'Ekler', 
    text: 'Ekler', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Mail İşlem Bilgileri', 
    fields: ['MailAdress', 'Title', 'Message', 'IsSend', 'IsBulk', 'SendDate', 'Response', 'Attachments'] 
  }
];

export const formLoadUrl = '';
export const formLoadRequest: ((recid: any, parentFormData?: any) => any) | undefined = undefined;
export const formDataMapper = (data: any) => data;
