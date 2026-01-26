// AccessEvents table columns configuration
import { TableColumn, ColumnType, TableRow, TableColumnOption } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Helper function to render inOUT field (Giriş/Çıkış)
function renderInOut(record: TableRow): string {
  const value = record['inOUT'];
  if (value === 0 || value === '0' || value === false || value === 'Giriş') {
    return '<span style="color: #238749; font-weight: 500;">Giriş</span>';
  } else if (value === 1 || value === '1' || value === true || value === 'Çıkış') {
    return '<span style="color: #c91818; font-weight: 500;">Çıkış</span>';
  }
  return '';
}

// Helper function to render EventType field (0 = RED, 1 = Onaylandı)
function renderEventType(record: TableRow): string {
  const value = record['EventType'];
  if (value === 0 || value === '0' || value === false) {
    return '<span style="color: #c91818; font-weight: 500;">RED</span>';
  } else if (value === 1 || value === '1' || value === true) {
    return '<span style="color: #238749; font-weight: 500;">Onaylandı</span>';
  }
  return '';
}

export const tableColumns: TableColumn[] = [
  { 
    field: 'AccessEventID', 
    label: 'Olay ID', 
    text: 'Olay ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true
  },
  { 
    field: 'Employee.Name', 
    label: 'Kişi Adı', 
    text: 'Kişi Adı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const employee = record['Employee'];
      if (employee) {
        return `${employee['Name'] || ''}`.trim();
      }
      return '';
    }
  },
  { 
    field: 'Employee.SurName', 
    label: 'Kişi Soyadı', 
    text: 'Kişi Soyadı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const employee = record['Employee'];
      return employee?.['SurName'] || '';
    }
  },
  { 
    field: 'TagCode', 
    label: 'Tag Kodu', 
    text: 'Tag Kodu',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'inOUT', 
    label: 'Yön', 
    text: 'Yön',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: renderInOut
  },
  { 
    field: 'Location', 
    label: 'Lokasyon', 
    text: 'Lokasyon',
    type: 'enum' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'enum' as ColumnType,
    searchField: 'DeviceSerial',
    resizable: true,
    load: {
      url: `${apiUrl}/api/Terminals`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return (data?.records || []).map((item: any) => ({
          id: item?.SerialNumber ?? item?.DeviceSerial ?? item?.ReaderID ?? item?.Id ?? item?.id,
          text: item?.ReaderName ?? item?.Name ?? String(item?.SerialNumber ?? item?.ReaderID ?? '')
        }));
      }
    },
    render: (record: TableRow) => String(record['Location'] ?? '')
  },
  { 
    field: 'DeviceSerial', 
    label: 'Cihaz Seri No', 
    text: 'Cihaz Seri No',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'EventType', 
    label: 'Olay Tipi', 
    text: 'Olay Tipi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'checkbox' as ColumnType,
    resizable: true,
    options: [
      { label: 'RED', value: 0 },
      { label: 'Onaylandı', value: 1 }
    ] as TableColumnOption[],
    render: renderEventType
  },
  { 
    field: 'EventDesc', 
    label: 'Olay Açıklaması', 
    text: 'Olay Açıklaması',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'EventTime', 
    label: 'Olay Zamanı', 
    text: 'Olay Zamanı',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'datetime' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      if (!record['EventTime']) return '';
      
      const eventTime = record['EventTime'];
      if (eventTime instanceof Date || (typeof eventTime === 'string' && eventTime.length > 0)) {
        const date = new Date(eventTime);
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
      return String(eventTime || '');
    }
  },
  { 
    field: 'RecordTime', 
    label: 'Kayıt Zamanı', 
    text: 'Kayıt Zamanı',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'datetime' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      if (!record['RecordTime']) return '';
      
      const recordTime = record['RecordTime'];
      if (recordTime instanceof Date || (typeof recordTime === 'string' && recordTime.length > 0)) {
        const date = new Date(recordTime);
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
      return String(recordTime || '');
    }
  },
  { 
    field: 'EventSource', 
    label: 'Olay Kaynağı', 
    text: 'Olay Kaynağı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'isOffline', 
    label: 'Offline', 
    text: 'Offline',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    min: 20,
    searchable: 'checkbox' as ColumnType,
    resizable: true
  },
  { 
    field: 'isPdks', 
    label: 'Puantaj', 
    text: 'Puantaj',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    min: 20,
    searchable: 'checkbox' as ColumnType,
    resizable: true
  },
  { 
    field: 'ReferanceID', 
    label: 'Referans ID', 
    text: 'Referans ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true
  }
];
