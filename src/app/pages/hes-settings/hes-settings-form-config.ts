// HesSettings form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'ClientId', 
    label: 'Müşteri ID', 
    text: 'Müşteri ID', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'ClientPassword', 
    label: 'Müşteri Şifresi', 
    text: 'Müşteri Şifresi', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'ApiUrl', 
    label: 'API URL', 
    text: 'API URL', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'HesCodeField', 
    label: 'HES Kodu Alanı', 
    text: 'HES Kodu Alanı', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'IsVaccinated', 
    label: 'Aşılı', 
    text: 'Aşılı', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'IsImmune', 
    label: 'Bağışıklı', 
    text: 'Bağışıklı', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'LastNegativeTestDate', 
    label: 'Son Negatif Test Tarihi', 
    text: 'Son Negatif Test Tarihi', 
    type: 'datetime' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'LastNegativeTestDateDay', 
    label: 'Son Negatif Test Günü', 
    text: 'Son Negatif Test Günü', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'Delay', 
    label: 'Gecikme', 
    text: 'Gecikme', 
    type: 'int' as ColumnType,
    fullWidth: false
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'HES Ayarı Bilgileri', 
    fields: ['ClientId', 'ClientPassword', 'ApiUrl', 'HesCodeField', 'IsVaccinated', 'IsImmune', 'LastNegativeTestDate', 'LastNegativeTestDateDay', 'Delay'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/HesSettings/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditHesSetting'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};
