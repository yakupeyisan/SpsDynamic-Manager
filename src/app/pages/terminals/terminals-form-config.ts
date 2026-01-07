// Terminals form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'ReaderName', 
    label: 'Terminal Adı', 
    text: 'Terminal Adı', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'SerialNumber', 
    label: 'Seri Numarası', 
    text: 'Seri Numarası', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'ReaderType', 
    label: 'Terminal Tipi', 
    text: 'Terminal Tipi', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'IpAddress', 
    label: 'IP Adresi', 
    text: 'IP Adresi', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'DevicePort', 
    label: 'Cihaz Portu', 
    text: 'Cihaz Portu', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'ConnectionType', 
    label: 'Bağlantı Tipi', 
    text: 'Bağlantı Tipi', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'ServerIPAddress', 
    label: 'Sunucu IP Adresi', 
    text: 'Sunucu IP Adresi', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'ServerPort', 
    label: 'Sunucu Portu', 
    text: 'Sunucu Portu', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'Password', 
    label: 'Şifre', 
    text: 'Şifre', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'ReaderPort', 
    label: 'Okuyucu Portu', 
    text: 'Okuyucu Portu', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'inOUT', 
    label: 'Giriş/Çıkış', 
    text: 'Giriş/Çıkış', 
    type: 'text' as ColumnType,
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
    field: 'Version', 
    label: 'Versiyon', 
    text: 'Versiyon', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'isPdks', 
    label: 'PDKS', 
    text: 'PDKS', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'isCafeteria', 
    label: 'Kafeterya', 
    text: 'Kafeterya', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'isAccess', 
    label: 'Erişim', 
    text: 'Erişim', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'isLive', 
    label: 'Canlı İzleme', 
    text: 'Canlı İzleme', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'isLocal', 
    label: 'Yerel', 
    text: 'Yerel', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'CardTypeID', 
    label: 'Kart Tipi ID', 
    text: 'Kart Tipi ID', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'CafeteriaAccountId', 
    label: 'Kafeterya Hesap ID', 
    text: 'Kafeterya Hesap ID', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'WorkTimeZoneId', 
    label: 'Çalışma Zaman Dilimi ID', 
    text: 'Çalışma Zaman Dilimi ID', 
    type: 'int' as ColumnType,
    fullWidth: false
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Genel Bilgiler', 
    fields: ['ReaderName', 'SerialNumber', 'ReaderType', 'IpAddress', 'DevicePort', 'ConnectionType', 'ServerIPAddress', 'ServerPort', 'Password', 'ReaderPort', 'inOUT', 'Status', 'Version'] 
  },
  { 
    label: 'Özellikler', 
    fields: ['isPdks', 'isCafeteria', 'isAccess', 'isLive', 'isLocal', 'CardTypeID', 'CafeteriaAccountId', 'WorkTimeZoneId'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/Terminals/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditTerminal'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};
