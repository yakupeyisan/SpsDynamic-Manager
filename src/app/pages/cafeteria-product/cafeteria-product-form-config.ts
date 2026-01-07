// CafeteriaProduct form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'ProductBarcode', 
    label: 'Barkod', 
    text: 'Barkod', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'ProductName', 
    label: 'Ürün Adı', 
    text: 'Ürün Adı', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'ProductType', 
    label: 'Ürün Tipi', 
    text: 'Ürün Tipi', 
    type: 'list' as ColumnType,
    load: {
      url: `${apiUrl}/api/CafeteriaProductTypes`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.ProductTypeID || item.Id || item.id,
          text: item.ProductTypeName || item.Name || `ID: ${item.ProductTypeID || item.Id || item.id}`
        }));
      }
    },
    fullWidth: false
  },
  { 
    field: 'Price', 
    label: 'Fiyat', 
    text: 'Fiyat', 
    type: 'currency' as ColumnType,
    currencyPrefix: '',
    currencySuffix: '₺',
    currencyPrecision: 2,
    fullWidth: false
  },
  { 
    field: 'ProductDescription', 
    label: 'Ürün Açıklaması', 
    text: 'Ürün Açıklaması', 
    type: 'textarea' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'ReturnPeriod', 
    label: 'İade Süresi', 
    text: 'İade Süresi', 
    type: 'int' as ColumnType,
    fullWidth: false
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Ürün Bilgileri', 
    fields: ['ProductBarcode', 'ProductName', 'ProductType', 'Price', 'ProductDescription', 'ReturnPeriod'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/CafeteriaProducts/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditCafeteriaProduct'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  
  // Map nested CafeteriaProductType object to ProductType field
  if (apiRecord.CafeteriaProductType && (apiRecord.CafeteriaProductType.ProductTypeID || apiRecord.CafeteriaProductType.Id)) {
    formData['ProductType'] = apiRecord.CafeteriaProductType.ProductTypeID || apiRecord.CafeteriaProductType.Id;
  }
  
  return formData;
};
