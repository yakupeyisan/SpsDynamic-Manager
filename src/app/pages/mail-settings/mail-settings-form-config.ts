// MailSettings form configuration (eski Mail Ayarları form ile uyumlu: 3 sekme)
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Form fields: Genel Ayarlar (0), Hermes İletişim Api (1), SMTP (2)
export const formFields: TableColumn[] = [
  // --- Sekme 0: Genel Ayarlar ---
  {
    field: 'ID',
    label: 'ID',
    text: 'ID',
    type: 'int' as ColumnType,
    fullWidth: false,
    disabled: true,
    showInAdd: false,
    showInUpdate: true
  },
  {
    field: 'Name',
    label: 'Adı',
    text: 'Adı',
    type: 'text' as ColumnType,
    fullWidth: true
  },
  // --- Sekme 1: Hermes İletişim Api ---
  {
    field: 'UserName',
    label: 'Kullanıcı Adı',
    text: 'Kullanıcı Adı',
    type: 'text' as ColumnType,
    fullWidth: true
  },
  {
    field: 'UserPass',
    label: 'Şifre',
    text: 'Şifre',
    type: 'text' as ColumnType,
    fullWidth: true
  },
  {
    field: 'CustomerCode',
    label: 'Müşteri Kodu',
    text: 'Müşteri Kodu',
    type: 'text' as ColumnType,
    fullWidth: true,
    hidden: true
  },
  {
    field: 'ApiKey',
    label: 'ApiKey',
    text: 'ApiKey',
    type: 'text' as ColumnType,
    fullWidth: true
  },
  {
    field: 'VendorCode',
    label: 'Vendor Kodu',
    text: 'Vendor Kodu',
    type: 'text' as ColumnType,
    fullWidth: true
  },
  {
    field: 'OriginatorId',
    label: 'Originator',
    text: 'Originator',
    type: 'text' as ColumnType,
    fullWidth: true
  },
  {
    field: 'TemplateId',
    label: 'Template',
    text: 'Template',
    type: 'text' as ColumnType,
    fullWidth: true
  },
  // --- Sekme 2: SMTP ---
  {
    field: 'Protocol',
    label: 'Protokol',
    text: 'Protokol',
    type: 'list' as ColumnType,
    fullWidth: true,
    options: [
      { label: 'Smtp', value: 'Smtp' },
      { label: 'Mail', value: 'Mail' },
      { label: 'Send Mail', value: 'Send Mail' }
    ]
  },
  {
    field: 'SMTPHost',
    label: 'Host',
    text: 'Host',
    type: 'textarea' as ColumnType,
    fullWidth: true
  },
  {
    field: 'SMTPUser',
    label: 'Kullanıcı',
    text: 'Kullanıcı',
    type: 'text' as ColumnType,
    fullWidth: true
  },
  {
    field: 'SMTPPass',
    label: 'Şifre',
    text: 'Şifre',
    type: 'text' as ColumnType,
    fullWidth: true
  },
  {
    field: 'SMTPPort',
    label: 'Port',
    text: 'Port',
    type: 'int' as ColumnType,
    fullWidth: false
  },
  {
    field: 'SMTPCrypto',
    label: 'Şifreleme Türü',
    text: 'Şifreleme Türü',
    type: 'list' as ColumnType,
    fullWidth: true,
    options: [
      { label: 'No Encryption', value: '' },
      { label: 'TLS', value: 'TLS' },
      { label: 'SSL', value: 'SSL' }
    ]
  },
  {
    field: 'MailType',
    label: 'Tipi',
    text: 'Tipi',
    type: 'list' as ColumnType,
    fullWidth: true,
    options: [
      { label: 'Html', value: 'Html' },
      { label: 'Text', value: 'Text' }
    ]
  },
  {
    field: 'Charset',
    label: 'Karakter Seti',
    text: 'Karakter Seti',
    type: 'list' as ColumnType,
    fullWidth: true,
    options: [
      { label: 'UTF-8', value: 'UTF-8' },
      { label: 'ISO-8859-1', value: 'ISO-8859-1' },
      { label: 'ETC', value: 'ETC' }
    ]
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

// 3 sekme: Genel Ayarlar, Hermes İletişim Api, SMTP
export const formTabs: FormTab[] = [
  {
    label: 'Genel Ayarlar',
    fields: ['ID', 'Name']
  },
  {
    label: 'Hermes İletişim Api',
    fields: ['UserName', 'UserPass', 'CustomerCode', 'ApiKey', 'VendorCode', 'OriginatorId', 'TemplateId']
  },
  {
    label: 'SMTP',
    fields: ['Protocol', 'SMTPHost', 'SMTPUser', 'SMTPPass', 'SMTPPort', 'SMTPCrypto', 'MailType', 'Charset', 'FromMail', 'FromName']
  }
];

export const formLoadUrl = `${apiUrl}/api/MailSettings/form`;

export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditMailSetting'
});

export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};
