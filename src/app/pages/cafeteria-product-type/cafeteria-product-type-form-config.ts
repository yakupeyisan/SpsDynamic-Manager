// CafeteriaProductType form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'ProductTypeName', 
    label: 'Ürün Tipi Adı', 
    text: 'Ürün Tipi Adı', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'ProductTypeDescription', 
    label: 'Ürün Tipi Açıklaması', 
    text: 'Ürün Tipi Açıklaması', 
    type: 'textarea' as ColumnType,
    fullWidth: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Ürün Tipi Bilgileri', 
    fields: ['ProductTypeName', 'ProductTypeDescription'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/CafeteriaProductTypes/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditCafeteriaProductType'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};
