// SmsSettings form configuration
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
    field: 'Orginator', 
    label: 'Gönderen', 
    text: 'Gönderen', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'Username', 
    label: 'Kullanıcı Adı', 
    text: 'Kullanıcı Adı', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'Password', 
    label: 'Şifre', 
    text: 'Şifre', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'Url', 
    label: 'URL', 
    text: 'URL', 
    type: 'text' as ColumnType,
    fullWidth: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'SMS Ayarı Bilgileri', 
    fields: ['Name', 'Orginator', 'Username', 'Password', 'Url'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/SmsSettings/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditSmsSetting'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};
