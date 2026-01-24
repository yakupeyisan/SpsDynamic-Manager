// SecureFields form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'Source', 
    label: 'Kaynak', 
    text: 'Kaynak', 
    type: 'list' as ColumnType,
    fullWidth: true,
    load: {
      url: `${apiUrl}/api/SecureFields/GetSources`,
      injectAuth: true,
      method: 'POST' as const,
      data: {},
      map: (data: any) => {
        if (!data || !data.records || !Array.isArray(data.records)) {
          return [];
        }
        return data.records.map((item: any) => ({
          id: item,
          text: item
        }));
      }
    }
  },
  { 
    field: 'Field', 
    label: 'Alan', 
    text: 'Alan', 
    type: 'list' as ColumnType,
    fullWidth: true,
    load: {
      url: (formData?: any) => {
        const source = formData?.['Source'] || null;
        if (!source) {
          return `${apiUrl}/api/SecureFields/GetFields`;
        }
        return `${apiUrl}/api/SecureFields/GetFields/${encodeURIComponent(source)}`;
      },
      injectAuth: true,
      method: 'POST' as const,
      data: (formData?: any) => {
        return {};
      },
      map: (data: any) => {
        if (!data || !data.records || !Array.isArray(data.records)) {
          return [];
        }
        return data.records.map((item: any) => ({
          id: item,
          text: item
        }));
      }
    }
  },
  { 
    field: 'Description', 
    label: 'Açıklama', 
    text: 'Açıklama', 
    type: 'text' as ColumnType,
    fullWidth: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Güvenli Girdi Bilgileri', 
    fields: ['Source', 'Field', 'Description'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/SecureFields/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditSecureField'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};
