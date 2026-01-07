// LiveViewSettings form configuration
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
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Canlı İzleme Ayarı Bilgileri', 
    fields: ['Name'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/LiveViewSettings/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditLiveViewSetting'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};
