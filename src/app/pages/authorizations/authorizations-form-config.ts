// Authorizations form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

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
    field: 'AuthorizationGroup', 
    label: 'Yetki Grubu', 
    text: 'Yetki Grubu', 
    type: 'list' as ColumnType,
    options: [
      { label: 'Kişisel Sayfa', value: '0' },
      { label: 'Yönetim Sayfası', value: '1' }
    ],
    fullWidth: false
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Yetki Bilgileri', 
    fields: ['Name', 'AuthorizationGroup'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/Authorizations/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditAuthorization'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};
