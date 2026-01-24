// AccessGroup form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'AccessGroupName', 
    label: 'Geçiş Yetki Grubu Adı', 
    text: 'Geçiş Yetki Grubu Adı', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'Description', 
    label: 'Açıklama', 
    text: 'Açıklama', 
    type: 'textarea' as ColumnType,
    fullWidth: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Geçiş Yetki Grubu Bilgileri', 
    fields: ['AccessGroupName', 'Description'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/AccessGroups/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditAccessGroup'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};

