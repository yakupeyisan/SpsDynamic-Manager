// Terminals table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

// Helper function to render inOUT field (Giriş/Çıkış)
function renderInOut(record: TableRow): string {
  const value = record['inOUT'];
  if (value === 0 || value === '0' || value === false) {
    return '<span style="color: #238749; font-weight: 500;">Giriş</span>';
  } else if (value === 1 || value === '1' || value === true) {
    return '<span style="color: #c91818; font-weight: 500;">Çıkış</span>';
  }
  return '';
}

// Helper function to render LastConnectionTime with "Bağlantı Yok" in red
function renderLastConnectionTime(record: TableRow): string {
  const value = record['LastConnectionTime'];
  if (!value || value === null || value === '' || value === 'Bağlantı Yok') {
    return '<span style="background-color: #ffebee; color: #c91818; padding: 2px 6px; border-radius: 3px; font-weight: 500;">Bağlantı Yok</span>';
  }
  // Format the date if it's a valid date
  if (value instanceof Date || (typeof value === 'string' && value.length > 0)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
  }
  return String(value || '');
}

export const tableColumns: TableColumn[] = [
  { 
    field: 'ReaderID', 
    label: 'Id (Terminal)', 
    text: 'Id (Terminal)',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '40px', 
    size: '40px',
    min: 20,
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'ReaderName', 
    label: 'Terminal Adı', 
    text: 'Terminal Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '300px', 
    size: '300px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'inOUT', 
    label: 'Yön', 
    text: 'Yön',
    type: 'list' as ColumnType, 
    sortable: true, 
    width: '50px', 
    size: '50px',
    min: 20,
    searchable: 'list',
    resizable: true,
    options: [
      { label: 'Giriş', value: 0 },
      { label: 'Çıkış', value: 1 }
    ],
    render: renderInOut
  },
  { 
    field: 'SerialNumber', 
    label: 'Seri No', 
    text: 'Seri No',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'ReaderType', 
    label: 'Tipi', 
    text: 'Tipi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '50px', 
    size: '50px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'IpAddress', 
    label: 'Ip Adresi', 
    text: 'Ip Adresi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'DevicePort', 
    label: 'Port', 
    text: 'Port',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '60px', 
    size: '60px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'isAccess', 
    label: 'Geçiş Kontrol', 
    text: 'Geçiş Kontrol',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '60px', 
    size: '60px',
    min: 20,
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'isCafeteria', 
    label: 'Kafeterya Kullanımı', 
    text: 'Kafeterya Kullanımı',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '60px', 
    size: '60px',
    min: 20,
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'isLocal', 
    label: 'Tanımlama', 
    text: 'Tanımlama',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '60px', 
    size: '60px',
    min: 20,
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'isLive', 
    label: 'Canlı İzleme', 
    text: 'Canlı İzleme',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '60px', 
    size: '60px',
    min: 20,
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'isPdks', 
    label: 'Puantaj', 
    text: 'Puantaj',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '60px', 
    size: '60px',
    min: 20,
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'isCafeteriaDailyLimit', 
    label: 'Kafeterya Günlük Limit', 
    text: 'Kafeterya Günlük Limit',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '60px', 
    size: '60px',
    min: 20,
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'isAntiPassBack', 
    label: 'Antipassback', 
    text: 'Antipassback',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '60px', 
    size: '60px',
    min: 20,
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'Status', 
    label: 'Durum', 
    text: 'Durum',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '60px', 
    size: '60px',
    min: 20,
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'LocationType', 
    label: 'Kapı Tipi', 
    text: 'Kapı Tipi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '60px', 
    size: '60px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'RelayHoldTime', 
    label: 'Role(sn)', 
    text: 'Role(sn)',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    min: 20,
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'LastConnectionTime', 
    label: 'Son Bağlantı', 
    text: 'Son Bağlantı',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'datetime',
    resizable: true,
    render: renderLastConnectionTime
  },
  { 
    field: 'AccessPermissionUpdateTime', 
    label: 'Yetki Güncellenme', 
    text: 'Yetki Güncellenme',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'datetime',
    resizable: true
  }
];
