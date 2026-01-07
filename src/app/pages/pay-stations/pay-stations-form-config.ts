// PayStations form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'Location', 
    label: 'Konum', 
    text: 'Konum', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'UserName', 
    label: 'Kullanıcı Adı', 
    text: 'Kullanıcı Adı', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'Password', 
    label: 'Şifre', 
    text: 'Şifre', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'Status', 
    label: 'Durum', 
    text: 'Durum', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'DeviceSerial', 
    label: 'Cihaz Seri No', 
    text: 'Cihaz Seri No', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'CashBoxLevel', 
    label: 'Kasa Seviyesi', 
    text: 'Kasa Seviyesi', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'x5', 
    label: '5 TL', 
    text: '5 TL', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'x10', 
    label: '10 TL', 
    text: '10 TL', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'x20', 
    label: '20 TL', 
    text: '20 TL', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'x50', 
    label: '50 TL', 
    text: '50 TL', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'x100', 
    label: '100 TL', 
    text: '100 TL', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'x200', 
    label: '200 TL', 
    text: '200 TL', 
    type: 'int' as ColumnType,
    fullWidth: false
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Genel Bilgiler', 
    fields: ['Location', 'UserName', 'Password', 'Status', 'DeviceSerial', 'CashBoxLevel'] 
  },
  { 
    label: 'Para Birimleri', 
    fields: ['x5', 'x10', 'x20', 'x50', 'x100', 'x200'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/PayStations/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditPayStation'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};
