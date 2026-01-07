// MailSettings form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'Name', 
    label: 'Ad', 
    text: 'Ad', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'UserName', 
    label: 'Kullanıcı Adı', 
    text: 'Kullanıcı Adı', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'UserPass', 
    label: 'Kullanıcı Şifresi', 
    text: 'Kullanıcı Şifresi', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'CustomerCode', 
    label: 'Müşteri Kodu', 
    text: 'Müşteri Kodu', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'ApiKey', 
    label: 'API Anahtarı', 
    text: 'API Anahtarı', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'VendorCode', 
    label: 'Satıcı Kodu', 
    text: 'Satıcı Kodu', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'OriginatorId', 
    label: 'Gönderen ID', 
    text: 'Gönderen ID', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'TemplateId', 
    label: 'Şablon ID', 
    text: 'Şablon ID', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'Protocol', 
    label: 'Protokol', 
    text: 'Protokol', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'SMTPHost', 
    label: 'SMTP Host', 
    text: 'SMTP Host', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'SMTPUser', 
    label: 'SMTP Kullanıcı', 
    text: 'SMTP Kullanıcı', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'SMTPPass', 
    label: 'SMTP Şifre', 
    text: 'SMTP Şifre', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'SMTPPort', 
    label: 'SMTP Port', 
    text: 'SMTP Port', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'SMTPCrypto', 
    label: 'SMTP Şifreleme', 
    text: 'SMTP Şifreleme', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'MailType', 
    label: 'Mail Tipi', 
    text: 'Mail Tipi', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'Charset', 
    label: 'Karakter Seti', 
    text: 'Karakter Seti', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'FromMail', 
    label: 'Gönderen Mail', 
    text: 'Gönderen Mail', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'FromName', 
    label: 'Gönderen Adı', 
    text: 'Gönderen Adı', 
    type: 'text' as ColumnType,
    fullWidth: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Genel Bilgiler', 
    fields: ['Name', 'UserName', 'UserPass', 'CustomerCode', 'ApiKey', 'VendorCode', 'OriginatorId', 'TemplateId'] 
  },
  { 
    label: 'SMTP Ayarları', 
    fields: ['Protocol', 'SMTPHost', 'SMTPUser', 'SMTPPass', 'SMTPPort', 'SMTPCrypto', 'MailType', 'Charset', 'FromMail', 'FromName'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/MailSettings/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditMailSetting'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};
