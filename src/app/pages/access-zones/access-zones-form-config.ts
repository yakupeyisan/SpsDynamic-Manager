// AccessZones form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'ProjectID', 
    label: 'Proje ID', 
    text: 'Proje ID', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'ZoneName', 
    label: 'Bölge Adı', 
    text: 'Bölge Adı', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'ZoneDescription', 
    label: 'Bölge Açıklaması', 
    text: 'Bölge Açıklaması', 
    type: 'textarea' as ColumnType,
    fullWidth: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Bölge Bilgileri', 
    fields: ['ProjectID', 'ZoneName', 'ZoneDescription'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/AccessZones/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditAccessZone'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};
