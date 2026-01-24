// FreeCard form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Custom form fields for view form (read-only)
export const formFields: TableColumn[] = [
  { 
    field: 'CardTypeID', 
    label: 'Kart Tipi', 
    text: 'Kart Tipi', 
    type: 'list', 
    load: {
      url: `${apiUrl}/api/CardTypes`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.CardTypeID,
          text: item.CardType || item.CardTypeName || item.Name
        }));
      }
    }
  },
  { 
    field: 'CardCodeType', 
    label: 'Kart Kullanım Tipi', 
    text: 'Kart Kullanım Tipi', 
    type: 'list', 
    load: {
      url: `${apiUrl}/api/CardCodeTypes`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records ? data.records.map((item: any) => ({
          id: item.id,
          text: item.text
        })) : [
          { id: 'Wiegand26', text: 'Wiegand26' },
          { id: 'Wiegand34', text: 'Wiegand34' },
          { id: 'MIFARE', text: 'MIFARE' }
        ];
      }
    }
  },
  { 
    field: 'CardStatusId', 
    label: 'Kart Statü', 
    text: 'Kart Statü', 
    type: 'list', 
    load: {
      url: `${apiUrl}/api/CardStatuses`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records ? data.records.map((item: any) => ({
          id: item.Id,
          text: item.Name
        })) : [];
      }
    }
  },
  { 
    field: 'CafeteriaGroupID', 
    label: 'Kafeterya Grup', 
    text: 'Kafeterya Grup', 
    type: 'list' as ColumnType, 
    load: {
      url: `${apiUrl}/api/CafeteriaGroups`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        if (!data || !data.records || !Array.isArray(data.records)) {
          return [];
        }
        return data.records.map((item: any) => ({
          id: item.CafeteriaGroupID,
          text: item.CafeteriaGroupName || item.Name
        }));
      }
    }
  },
  { field: 'TagCode', label: 'Tag Kodu', text: 'Tag Kodu', type: 'text' },
  { field: 'CardUID', label: 'CardUID', text: 'CardUID', type: 'text' },
  { field: 'CardCode', label: 'Kart Kodu', text: 'Kart Kodu', type: 'int' },
  { field: 'FacilityCode', label: 'FacilityCode', text: 'FacilityCode', type: 'text' },
  { field: 'Plate', label: 'Plaka', text: 'Plaka', type: 'text' },
  { field: 'CardDesc', label: 'Kart Açıklaması', text: 'Kart Açıklaması', type: 'textarea', fullWidth: true },
  { field: 'Status', label: 'Durum', text: 'Durum', type: 'checkbox' },
  { field: 'isDefined', label: 'Tanımlı', text: 'Tanımlı', type: 'checkbox' }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Kart Bilgileri', 
    fields: ['CardTypeID', 'CardCodeType', 'CardStatusId', 'CafeteriaGroupID', 'TagCode', 'CardUID', 'CardCode', 'FacilityCode', 'Plate', 'CardDesc', 'Status', 'isDefined'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/Cards/FreeCards/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditCard'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  
  // Map nested CardType object to CardTypeID field
  if (apiRecord.CardType && apiRecord.CardType.CardTypeID) {
    formData['CardTypeID'] = apiRecord.CardType.CardTypeID;
  }
  
  // Map nested CardStatus object to CardStatusId field
  if (apiRecord.CardStatus && apiRecord.CardStatus.Id) {
    formData['CardStatusId'] = apiRecord.CardStatus.Id;
  }
  
  // Map nested CafeteriaGroup object to CafeteriaGroupID field
  if (apiRecord.CafeteriaGroup && apiRecord.CafeteriaGroup.CafeteriaGroupID) {
    formData['CafeteriaGroupID'] = apiRecord.CafeteriaGroup.CafeteriaGroupID;
  }
  
  return formData;
};
