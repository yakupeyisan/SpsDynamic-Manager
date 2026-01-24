// PaymentTypes form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

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
    field: 'Filter', 
    label: 'Filtre', 
    text: 'Filtre', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'LoginRequire', 
    label: 'Giriş Gerekli', 
    text: 'Giriş Gerekli', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'Amount', 
    label: 'Tutar', 
    text: 'Tutar', 
    type: 'currency' as ColumnType,
    currencyPrefix: '',
    currencySuffix: '₺',
    currencyPrecision: 2,
    fullWidth: false
  },
  { 
    field: 'PayMethod', 
    label: 'Ödeme Yöntemi', 
    text: 'Ödeme Yöntemi', 
    type: 'text' as ColumnType,
    fullWidth: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Ödeme Tipi Bilgileri', 
    fields: ['Name', 'Filter', 'LoginRequire', 'Amount', 'PayMethod'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/PaymentTypes/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditPaymentType'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};
