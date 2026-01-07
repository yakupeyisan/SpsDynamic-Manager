// CafeteriaAccounts form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'AccountName', 
    label: 'Hesap Adı', 
    text: 'Hesap Adı', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'SettingId', 
    label: 'Ayar ID', 
    text: 'Ayar ID', 
    type: 'int' as ColumnType,
    fullWidth: false
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Hesap Bilgileri', 
    fields: ['AccountName', 'SettingId'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/CafeteriaAccounts/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditCafeteriaAccount'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};
