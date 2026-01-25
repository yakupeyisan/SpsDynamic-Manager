// CardWriteList form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'TemplateId', 
    label: 'Kart Şablonu', 
    text: 'Kart Şablonu', 
    type: 'list', 
    load: {
      url: `${apiUrl}/api/CardTemplates`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.Id,
          text: item.Name || item.TemplateName || `ID: ${item.Id}`
        }));
      }
    }
  },
  { 
    field: 'CardId', 
    label: 'Kart ID', 
    text: 'Kart ID', 
    type: 'int' as ColumnType
  },
  { 
    field: 'WritedAt', 
    label: 'Yazdırma Tarihi', 
    text: 'Yazdırma Tarihi', 
    type: 'datetime' 
  },
  { 
    field: 'WritedUser', 
    label: 'Yazdıran Kullanıcı', 
    text: 'Yazdıran Kullanıcı', 
    type: 'int' 
  },
  { 
    field: 'WritedData', 
    label: 'Yazdırılan Veri', 
    text: 'Yazdırılan Veri', 
    type: 'textarea', 
    fullWidth: true 
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Kart Baskı Bilgileri', 
    fields: ['TemplateId', 'CardId', 'WritedAt', 'WritedUser', 'WritedData'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/CardWriteLists/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditCardWriteList'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  
  // Map nested CardTemplate object to TemplateId field
  if (apiRecord.CardTemplate && apiRecord.CardTemplate.Id) {
    formData['TemplateId'] = apiRecord.CardTemplate.Id;
  }
  
  // Map nested Card object to CardId field
  if (apiRecord.Card && apiRecord.Card.CardID) {
    formData['CardId'] = apiRecord.Card.CardID;
  }
  
  return formData;
};
