// PosDevices form configuration
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
  },
  { 
    field: 'PlaceID', 
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
    field: 'AccountId', 
    label: 'Hesap', 
    text: 'Hesap', 
    type: 'list' as ColumnType,
    load: {
      url: `${apiUrl}/api/CafeteriaAccounts`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.ID || item.Id || item.id,
          text: item.AccountName || item.Name || `ID: ${item.ID || item.Id || item.id}`
        }));
      }
    },
    fullWidth: false
  },
  { 
    field: 'PosSerial', 
    label: 'POS Seri No', 
    text: 'POS Seri No', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'Status', 
    label: 'Durum', 
    text: 'Durum', 
    type: 'text' as ColumnType,
    fullWidth: false
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'POS Cihaz Bilgileri', 
    fields: ['Name', 'PlaceID', 'AccountId', 'PosSerial', 'Status'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/PosDevices/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditPosDevice'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  
  // Map nested CafeteriaPlace object to PlaceID field
  if (apiRecord.CafeteriaPlace && (apiRecord.CafeteriaPlace.PlaceID || apiRecord.CafeteriaPlace.Id)) {
    formData['PlaceID'] = apiRecord.CafeteriaPlace.PlaceID || apiRecord.CafeteriaPlace.Id;
  }
  
  // Map nested CafeteriaAccount object to AccountId field
  if (apiRecord.CafeteriaAccount && (apiRecord.CafeteriaAccount.ID || apiRecord.CafeteriaAccount.Id)) {
    formData['AccountId'] = apiRecord.CafeteriaAccount.ID || apiRecord.CafeteriaAccount.Id;
  }
  
  return formData;
};
