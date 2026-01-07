// CafeteriaPlaces form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'PlaceName', 
    label: 'Bölge Adı', 
    text: 'Bölge Adı', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'PlaceDescription', 
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
    fields: ['PlaceName', 'PlaceDescription'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/CafeteriaPlaces/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditCafeteriaPlace'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};
