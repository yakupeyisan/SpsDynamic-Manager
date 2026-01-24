// Timezone form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'TimeZoneName', 
    label: 'Zaman Tanımı Adı', 
    text: 'Zaman Tanımı Adı', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'ProjectID', 
    label: 'Proje ID', 
    text: 'Proje ID', 
    type: 'text' as ColumnType,
    hidden: true
  },
  { 
    field: 'ReferanceID', 
    label: 'Referans ID', 
    text: 'Referans ID', 
    type: 'int' as ColumnType,
    hidden: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Zaman Tanımı Bilgileri', 
    fields: ['TimeZoneName', 'ProjectID', 'ReferanceID'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/TimeZones/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditTimezone'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};
