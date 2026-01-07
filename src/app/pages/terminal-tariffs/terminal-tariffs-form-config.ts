// TerminalTariffs form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'ReaderID', 
    label: 'Terminal', 
    text: 'Terminal', 
    type: 'list', 
    load: {
      url: `${apiUrl}/api/Terminals`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.ReaderID,
          text: item.ReaderName 
        }));
      }
    }
  },
  { 
    field: 'CafeteriaGroupID', 
    label: 'Kafeterya Grubu', 
    text: 'Kafeterya Grubu', 
    type: 'list', 
    load: {
      url: `${apiUrl}/api/CafeteriaGroups`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.CafeteriaGroupID || item.Id,
          text: item.CafeteriaGroupName || item.Name || `ID: ${item.CafeteriaGroupID || item.Id}`
        }));
      }
    }
  },
  // Uygulama 1
  { 
    field: 'App1FirstPassFee', 
    label: 'Uyg.1 İlk Geçiş Ücreti', 
    text: 'Uyg.1 İlk Geçiş Ücreti', 
    type: 'currency' as ColumnType,
    currencyPrefix: '',
    currencySuffix: '₺',
    currencyPrecision: 2,
    fullWidth: false
  },
  { 
    field: 'App1SecondPassFee', 
    label: 'Uyg.1 İkinci Geçiş Ücreti', 
    text: 'Uyg.1 İkinci Geçiş Ücreti', 
    type: 'currency' as ColumnType,
    currencyPrefix: '',
    currencySuffix: '₺',
    currencyPrecision: 2,
    fullWidth: false
  },
  { 
    field: 'App1PassLimitBalance', 
    label: 'Uyg.1 Geçiş Limit Bakiye', 
    text: 'Uyg.1 Geçiş Limit Bakiye', 
    type: 'list' as ColumnType,
    options: [
      { label: 'Limitsiz', value: -1 },
      { label: 'Kapalı', value: 0 },
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5', value: 5 },
      { label: '6', value: 6 },
      { label: '7', value: 7 }
    ],
    fullWidth: false
  },
  { 
    field: 'App1PassLimitCredit', 
    label: 'Uyg.1 Geçiş Limit Kredi', 
    text: 'Uyg.1 Geçiş Limit Kredi', 
    type: 'list' as ColumnType,
    options: [
      { label: 'Limitsiz', value: -1 },
      { label: 'Kapalı', value: 0 },
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5', value: 5 },
      { label: '6', value: 6 },
      { label: '7', value: 7 }
    ],
    fullWidth: false
  },
  // Uygulama 2
  { 
    field: 'App2FirstPassFee', 
    label: 'Uyg.2 İlk Geçiş Ücreti', 
    text: 'Uyg.2 İlk Geçiş Ücreti', 
    type: 'currency' as ColumnType,
    currencyPrefix: '',
    currencySuffix: '₺',
    currencyPrecision: 2,
    fullWidth: false
  },
  { 
    field: 'App2SecondPassFee', 
    label: 'Uyg.2 İkinci Geçiş Ücreti', 
    text: 'Uyg.2 İkinci Geçiş Ücreti', 
    type: 'currency' as ColumnType,
    currencyPrefix: '',
    currencySuffix: '₺',
    currencyPrecision: 2,
    fullWidth: false
  },
  { 
    field: 'App2PassLimitBalance', 
    label: 'Uyg.2 Geçiş Limit Bakiye', 
    text: 'Uyg.2 Geçiş Limit Bakiye', 
    type: 'list' as ColumnType,
    options: [
      { label: 'Limitsiz', value: -1 },
      { label: 'Kapalı', value: 0 },
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5', value: 5 },
      { label: '6', value: 6 },
      { label: '7', value: 7 }
    ],
    fullWidth: false
  },
  { 
    field: 'App2PassLimitCredit', 
    label: 'Uyg.2 Geçiş Limit Kredi', 
    text: 'Uyg.2 Geçiş Limit Kredi', 
    type: 'list' as ColumnType,
    options: [
      { label: 'Limitsiz', value: -1 },
      { label: 'Kapalı', value: 0 },
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5', value: 5 },
      { label: '6', value: 6 },
      { label: '7', value: 7 }
    ],
    fullWidth: false
  },
  // Uygulama 3
  { 
    field: 'App3FirstPassFee', 
    label: 'Uyg.3 İlk Geçiş Ücreti', 
    text: 'Uyg.3 İlk Geçiş Ücreti', 
    type: 'currency' as ColumnType,
    currencyPrefix: '',
    currencySuffix: '₺',
    currencyPrecision: 2,
    fullWidth: false
  },
  { 
    field: 'App3SecondPassFee', 
    label: 'Uyg.3 İkinci Geçiş Ücreti', 
    text: 'Uyg.3 İkinci Geçiş Ücreti', 
    type: 'currency' as ColumnType,
    currencyPrefix: '',
    currencySuffix: '₺',
    currencyPrecision: 2,
    fullWidth: false
  },
  { 
    field: 'App3PassLimitBalance', 
    label: 'Uyg.3 Geçiş Limit Bakiye', 
    text: 'Uyg.3 Geçiş Limit Bakiye', 
    type: 'list' as ColumnType,
    options: [
      { label: 'Limitsiz', value: -1 },
      { label: 'Kapalı', value: 0 },
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5', value: 5 },
      { label: '6', value: 6 },
      { label: '7', value: 7 }
    ],
    fullWidth: false
  },
  { 
    field: 'App3PassLimitCredit', 
    label: 'Uyg.3 Geçiş Limit Kredi', 
    text: 'Uyg.3 Geçiş Limit Kredi', 
    type: 'list' as ColumnType,
    options: [
      { label: 'Limitsiz', value: -1 },
      { label: 'Kapalı', value: 0 },
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5', value: 5 },
      { label: '6', value: 6 },
      { label: '7', value: 7 }
    ],
    fullWidth: false
  },
  // Uygulama 4
  { 
    field: 'App4FirstPassFee', 
    label: 'Uyg.4 İlk Geçiş Ücreti', 
    text: 'Uyg.4 İlk Geçiş Ücreti', 
    type: 'currency' as ColumnType,
    currencyPrefix: '',
    currencySuffix: '₺',
    currencyPrecision: 2,
    fullWidth: false
  },
  { 
    field: 'App4SecondPassFee', 
    label: 'Uyg.4 İkinci Geçiş Ücreti', 
    text: 'Uyg.4 İkinci Geçiş Ücreti', 
    type: 'currency' as ColumnType,
    currencyPrefix: '',
    currencySuffix: '₺',
    currencyPrecision: 2,
    fullWidth: false
  },
  { 
    field: 'App4PassLimitBalance', 
    label: 'Uyg.4 Geçiş Limit Bakiye', 
    text: 'Uyg.4 Geçiş Limit Bakiye', 
    type: 'list' as ColumnType,
    options: [
      { label: 'Limitsiz', value: -1 },
      { label: 'Kapalı', value: 0 },
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5', value: 5 },
      { label: '6', value: 6 },
      { label: '7', value: 7 }
    ],
    fullWidth: false
  },
  { 
    field: 'App4PassLimitCredit', 
    label: 'Uyg.4 Geçiş Limit Kredi', 
    text: 'Uyg.4 Geçiş Limit Kredi', 
    type: 'list' as ColumnType,
    options: [
      { label: 'Limitsiz', value: -1 },
      { label: 'Kapalı', value: 0 },
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5', value: 5 },
      { label: '6', value: 6 },
      { label: '7', value: 7 }
    ],
    fullWidth: false
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Genel Bilgiler', 
    fields: ['ProjectID', 'ReaderID', 'CafeteriaGroupID'] 
  },
  { 
    label: 'Uygulama 1', 
    fields: ['App1FirstPassFee', 'App1SecondPassFee', 'App1PassLimitBalance', 'App1PassLimitCredit'] 
  },
  { 
    label: 'Uygulama 2', 
    fields: ['App2FirstPassFee', 'App2SecondPassFee', 'App2PassLimitBalance', 'App2PassLimitCredit'] 
  },
  { 
    label: 'Uygulama 3', 
    fields: ['App3FirstPassFee', 'App3SecondPassFee', 'App3PassLimitBalance', 'App3PassLimitCredit'] 
  },
  { 
    label: 'Uygulama 4', 
    fields: ['App4FirstPassFee', 'App4SecondPassFee', 'App4PassLimitBalance', 'App4PassLimitCredit'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/TerminalTariffs/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditTerminalTariff'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  
  // Map nested Terminal object to ReaderID field
  if (apiRecord.Terminal && (apiRecord.Terminal.ReaderID || apiRecord.Terminal.Id || apiRecord.Terminal.TerminalID)) {
    formData['ReaderID'] = apiRecord.Terminal.ReaderID || apiRecord.Terminal.Id || apiRecord.Terminal.TerminalID;
  }
  
  // Map nested CafeteriaGroup object to CafeteriaGroupID field
  if (apiRecord.CafeteriaGroup && (apiRecord.CafeteriaGroup.CafeteriaGroupID || apiRecord.CafeteriaGroup.Id)) {
    formData['CafeteriaGroupID'] = apiRecord.CafeteriaGroup.CafeteriaGroupID || apiRecord.CafeteriaGroup.Id;
  }
  
  // Divide pass fee values by 100 for display (API stores them multiplied by 100)
  const passFeeFields = [
    'App1FirstPassFee', 'App1SecondPassFee',
    'App2FirstPassFee', 'App2SecondPassFee',
    'App3FirstPassFee', 'App3SecondPassFee',
    'App4FirstPassFee', 'App4SecondPassFee'
  ];
  
  passFeeFields.forEach(field => {
    if (formData[field] != null && formData[field] !== '' && formData[field] !== undefined) {
      const numValue = typeof formData[field] === 'string' ? parseFloat(formData[field]) : formData[field];
      if (!isNaN(numValue)) {
        formData[field] = numValue / 100;
      }
    }
  });
  
  return formData;
};
