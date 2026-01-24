// Terminals form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'ReaderName', 
    label: 'Okuyucu Adı', 
    text: 'Okuyucu Adı', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'ReaderType', 
    label: 'Terminal Tipi', 
    text: 'Terminal Tipi', 
    type: 'list' as ColumnType,
    fullWidth: false,
    options: [
      { label: 'AVES', value: 'AVES' },
      { label: 'ROSSLARE', value: 'ROSSLARE' },
      { label: 'TC101', value: 'TC101' },
      { label: 'TC101HGS', value: 'TC101HGS' },
      { label: 'HIKVISION K1T804', value: 'HIKVISION K1T804' }
    ]
  },
  { 
    field: 'CardTypeID', 
    label: 'CardTypeID', 
    text: 'CardTypeID', 
    type: 'list' as ColumnType,
    fullWidth: false,
    options: [
      { label: 'WIEGAND32', value: 1 },
      { label: 'WIEGAND56', value: 2 },
      { label: 'MIFARESECTOR', value: 3 },
      { label: 'HGS', value: 4 },
      { label: 'PARMAK IZI 1', value: 11 },
      { label: 'PARMAK IZI 2', value: 12 },
      { label: 'PARMAK IZI 3', value: 13 }
    ]
  },
  { 
    field: 'inOUT', 
    label: 'Okuyucu Yönü', 
    text: 'Okuyucu Yönü', 
    type: 'list' as ColumnType,
    fullWidth: false,
    options: [
      { label: 'Giriş', value: 0 },
      { label: 'Çıkış', value: 1 }
    ]
  },
  { 
    field: 'SerialNumber', 
    label: 'Seri No', 
    text: 'Seri No', 
    type: 'text' as ColumnType,
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
    field: 'IpAddress', 
    label: 'Ip Adresi', 
    text: 'Ip Adresi', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'DevicePort', 
    label: 'Port', 
    text: 'Port', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'ServerIPAddress', 
    label: 'Server IP Address', 
    text: 'Server IP Address', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'ServerPort', 
    label: 'Server Port', 
    text: 'Server Port', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'ConnectionType', 
    label: 'Bağlantı Tipi', 
    text: 'Bağlantı Tipi', 
    type: 'list' as ColumnType,
    fullWidth: false,
    options: [
      { label: 'UDP', value: 'UDP' },
      { label: 'TCP', value: 'TCP' }
    ]
  },
  { 
    field: 'ReaderTypeSelect', 
    label: 'Okuyucu Tipi', 
    text: 'Okuyucu Tipi', 
    type: 'radio' as ColumnType,
    fullWidth: true,
    options: [
      { label: 'Geçiş Kontrol', value: 'isAccess' },
      { label: 'Kafeterya', value: 'isCafeteria' },
      { label: 'Tanımlama', value: 'isLocal' }
    ]
  },
  { 
    field: 'isLive', 
    label: 'Canlı İzlenebilr mi?', 
    text: 'Canlı İzlenebilr mi?', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'isPdks', 
    label: 'Puantaj Kapısı mı?', 
    text: 'Puantaj Kapısı mı?', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'isCafeteriaDailyLimit', 
    label: 'Kafeterya Günlük Limit', 
    text: 'Kafeterya Günlük Limit', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'isAntiPassBack', 
    label: 'AntiPassBack', 
    text: 'AntiPassBack', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'isPoll', 
    label: 'Yoklama Kapısı mı?', 
    text: 'Yoklama Kapısı mı?', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'Status', 
    label: 'Durum', 
    text: 'Durum', 
    type: 'list' as ColumnType,
    fullWidth: false,
    options: [
      { label: 'KAPALI', value: 0 },
      { label: 'AÇIK', value: 1 }
    ]
  },
  { 
    field: 'ReaderPort', 
    label: 'Okuyucu Portu', 
    text: 'Okuyucu Portu', 
    type: 'list' as ColumnType,
    fullWidth: false,
    options: [
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '99', value: 99 }
    ]
  },
  { 
    field: 'CafeteriaAccountId', 
    label: 'Kafeterya Hesabı', 
    text: 'Kafeterya Hesabı', 
    type: 'list' as ColumnType,
    fullWidth: false,
    load: {
      url: `${apiUrl}/api/CafeteriaAccounts`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records ? data.records.map((item: any) => ({
          id: item.ID,
          text: item.AccountName
        })) : [];
      }
    }
  },
  { 
    field: 'WiegandType', 
    label: 'Wiegand Tipi', 
    text: 'Wiegand Tipi', 
    type: 'list' as ColumnType,
    fullWidth: false,
    options: [
      { label: 'WIEGAND32', value: 'WIEGAND32' },
      { label: 'WIEGAND26', value: 'WIEGAND26' }
    ]
  },
  { 
    field: 'NodeId', 
    label: 'Node No', 
    text: 'Node No', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'App1Start', 
    label: 'Başlangıç', 
    text: 'Başlangıç', 
    type: 'time' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'App2Start', 
    label: 'Başlangıç', 
    text: 'Başlangıç', 
    type: 'time' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'App3Start', 
    label: 'Başlangıç', 
    text: 'Başlangıç', 
    type: 'time' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'App4Start', 
    label: 'Başlangıç', 
    text: 'Başlangıç', 
    type: 'time' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'App1End', 
    label: 'Bitiş', 
    text: 'Bitiş', 
    type: 'time' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'App2End', 
    label: 'Bitiş', 
    text: 'Bitiş', 
    type: 'time' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'App3End', 
    label: 'Bitiş', 
    text: 'Bitiş', 
    type: 'time' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'App4End', 
    label: 'Bitiş', 
    text: 'Bitiş', 
    type: 'time' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'App1UseCredit', 
    label: 'Kredi Kontrolü', 
    text: 'Kredi Kontrolü', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'App2UseCredit', 
    label: 'Kredi Kontrolü', 
    text: 'Kredi Kontrolü', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'App3UseCredit', 
    label: 'Kredi Kontrolü', 
    text: 'Kredi Kontrolü', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'App4UseCredit', 
    label: 'Kredi Kontrolü', 
    text: 'Kredi Kontrolü', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'App1UseBalance', 
    label: 'Bakiye Kontrolü', 
    text: 'Bakiye Kontrolü', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'App2UseBalance', 
    label: 'Bakiye Kontrolü', 
    text: 'Bakiye Kontrolü', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'App3UseBalance', 
    label: 'Bakiye Kontrolü', 
    text: 'Bakiye Kontrolü', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'App4UseBalance', 
    label: 'Bakiye Kontrolü', 
    text: 'Bakiye Kontrolü', 
    type: 'checkbox' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'RelayIdGranted', 
    label: 'Onaylandığında Tetikle', 
    text: 'Onaylandığında Tetikle', 
    type: 'list' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'RelayIdDenied', 
    label: 'Onaylanmadığında Tetikle', 
    text: 'Onaylanmadığında Tetikle', 
    type: 'list' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'RelayHoldTime', 
    label: 'Role Süresi', 
    text: 'Role Süresi', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'LocationType', 
    label: 'Kapı Tipi', 
    text: 'Kapı Tipi', 
    type: 'list' as ColumnType,
    fullWidth: false,
    options: [
      { label: 'DOOR', value: 'DOOR' },
      { label: 'TURNSTILE', value: 'TURNSTILE' }
    ]
  },
  { 
    field: 'SntpServer', 
    label: 'Sntp Server', 
    text: 'Sntp Server', 
    type: 'text' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'ServerIPAddressFirmwareUpdate', 
    label: 'Firmware Server', 
    text: 'Firmware Server', 
    type: 'text' as ColumnType,
    fullWidth: false
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Genel', 
    fields: [
      'ReaderName',          // Okuyucu Adı
      'ReaderType',          // Terminal Tipi
      'inOUT',               // Okuyucu Yönü
      'SerialNumber',        // Seri No
      'Password',            // Şifre
      'CardTypeID',          // CardTypeID
      'WiegandType',         // Wiegand Tipi
      'ReaderTypeSelect',    // Okuyucu Tipi
      'Status',              // Durum
      'isLive',              // Canlı İzlenebilir mi?
      'isPdks',              // Puantaj Kapısı mı?
      'isCafeteriaDailyLimit', // Kafeterya Günlük Limit
      'isAntiPassBack',      // AntiPassBack
      'isPoll',              // Yoklama Kapısı mı?
      'CafeteriaAccountId',   // Kafeterya Hesabı
    ]
  },
  { 
    label: 'Bağlantı Ayarları', 
    fields: [
      'IpAddress',           // Ip Adresi
      'DevicePort',          // Port
      'ServerIPAddress',     // Server IP Address
      'ServerPort',          // Server Port
      'ConnectionType'       // Bağlantı Tipi
    ]
  },
  { 
    label: 'Diğer', 
    fields: [
      'ReaderPort',          // Okuyucu Portu
      'NodeId',              // Node No
      'RelayIdGranted',      // Onaylandığında Tetikle
      'RelayIdDenied',       // Onaylanmadığında Tetikle
      'RelayHoldTime',       // Role Süresi
      'LocationType',        // Kapı Tipi
      'SntpServer',          // Sntp Server
      'ServerIPAddressFirmwareUpdate' // Firmware Server
    ]
  },
  { 
    label: 'OGLEN YEMEK', 
    fields: ['App1Start', 'App1End', 'App1UseCredit', 'App1UseBalance']
  },
  { 
    label: 'KAHVALTI', 
    fields: ['App2Start', 'App2End', 'App2UseCredit', 'App2UseBalance']
  },
  { 
    label: 'BOŞ 2', 
    fields: ['App3Start', 'App3End', 'App3UseCredit', 'App3UseBalance']
  },
  { 
    label: 'BOŞ 3', 
    fields: ['App4Start', 'App4End', 'App4UseCredit', 'App4UseBalance']
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
  // Set default values for time fields if not present
  if (!formData.App1Start) formData.App1Start = '00:00';
  if (!formData.App2Start) formData.App2Start = '00:00';
  if (!formData.App3Start) formData.App3Start = '00:00';
  if (!formData.App4Start) formData.App4Start = '00:00';
  if (!formData.App1End) formData.App1End = '00:00';
  if (!formData.App2End) formData.App2End = '00:00';
  if (!formData.App3End) formData.App3End = '00:00';
  if (!formData.App4End) formData.App4End = '00:00';
  if (!formData.NodeId) formData.NodeId = 1;
  
  // Set ReaderTypeSelect based on checkbox values (for edit mode)
  if (formData.isAccess === true || formData.isAccess === 1 || formData.isAccess === '1') {
    formData.ReaderTypeSelect = 'isAccess';
  } else if (formData.isCafeteria === true || formData.isCafeteria === 1 || formData.isCafeteria === '1') {
    formData.ReaderTypeSelect = 'isCafeteria';
  } else if (formData.isLocal === true || formData.isLocal === 1 || formData.isLocal === '1') {
    formData.ReaderTypeSelect = 'isLocal';
  }
  
  return formData;
};
