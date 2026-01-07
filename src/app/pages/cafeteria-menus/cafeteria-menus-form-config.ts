// CafeteriaMenus form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'PlaceId', 
    label: 'Bölge', 
    text: 'Bölge', 
    type: 'list' as ColumnType,
    load: {
      url: `${apiUrl}/api/CafeteriaPlaces`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.PlaceID || item.Id || item.id,
          text: item.PlaceName || item.Name || `ID: ${item.PlaceID || item.Id || item.id}`
        }));
      }
    },
    fullWidth: false
  },
  { 
    field: 'Name', 
    label: 'Menü Adı', 
    text: 'Menü Adı', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'CafeteriaAppName', 
    label: 'Kafeterya Uygulama Adı', 
    text: 'Kafeterya Uygulama Adı', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'MenuDay', 
    label: 'Menü Günü', 
    text: 'Menü Günü', 
    type: 'int' as ColumnType,
    fullWidth: false
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Menü Bilgileri', 
    fields: ['PlaceId', 'Name', 'CafeteriaAppName', 'MenuDay'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/CafeteriaMenus/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditCafeteriaMenu'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  
  // Map nested CafeteriaPlace object to PlaceId field
  if (apiRecord.CafeteriaPlace && (apiRecord.CafeteriaPlace.PlaceID || apiRecord.CafeteriaPlace.Id)) {
    formData['PlaceId'] = apiRecord.CafeteriaPlace.PlaceID || apiRecord.CafeteriaPlace.Id;
  }
  
  return formData;
};
