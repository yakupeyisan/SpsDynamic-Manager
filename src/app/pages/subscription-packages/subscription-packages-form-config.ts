// SubscriptionPackages form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.apiUrl;

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
    field: 'ApplicationID', 
    label: 'Uygulama', 
    text: 'Uygulama', 
    type: 'list', 
    load: {
      url: `${apiUrl}/api/CafeteriaApplications`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.Id || item.ApplicationID,
          text: item.Name || item.ApplicationName || `ID: ${item.Id || item.ApplicationID}`
        }));
      }
    }
  },
  { 
    field: 'Name', 
    label: 'Paket Adı', 
    text: 'Paket Adı', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'DayOfWeek', 
    label: 'Haftanın Günü', 
    text: 'Haftanın Günü', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'HowManyDays', 
    label: 'Kaç Gün', 
    text: 'Kaç Gün', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'Holiday', 
    label: 'Tatil', 
    text: 'Tatil', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'Amount', 
    label: 'Tutar', 
    text: 'Tutar', 
    type: 'float' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'Status', 
    label: 'Durum', 
    text: 'Durum', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'StartRule', 
    label: 'Başlangıç Kuralı', 
    text: 'Başlangıç Kuralı', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'StartDay', 
    label: 'Başlangıç Günü', 
    text: 'Başlangıç Günü', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'MinOrderDay', 
    label: 'Min Sipariş Günü', 
    text: 'Min Sipariş Günü', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'IsSelectable', 
    label: 'Seçilebilir', 
    text: 'Seçilebilir', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'Description', 
    label: 'Açıklama', 
    text: 'Açıklama', 
    type: 'textarea' as ColumnType,
    fullWidth: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Paket Bilgileri', 
    fields: ['ProjectID', 'ApplicationID', 'Name', 'DayOfWeek', 'HowManyDays', 'Holiday', 'Amount', 'Status', 'StartRule', 'StartDay', 'MinOrderDay', 'IsSelectable', 'Description'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/SubscriptionPackages/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditSubscriptionPackage'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  
  // Map nested Application object to ApplicationID field
  if (apiRecord.Application && (apiRecord.Application.Id || apiRecord.Application.ApplicationID)) {
    formData['ApplicationID'] = apiRecord.Application.Id || apiRecord.Application.ApplicationID;
  }
  
  return formData;
};
