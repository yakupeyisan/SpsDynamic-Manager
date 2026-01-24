// EmployeeWithLocation table columns configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Helper function to render inOUT field (Giriş/Çıkış)
function renderInOut(record: TableRow): string {
  const accessEvent = record['EmployeeLastAccessEvent'];
  if (!accessEvent) return '';
  
  const value = accessEvent['inOUT'];
  if (value === 0 || value === '0' || value === false || value === 'Giriş') {
    return '<span style="color: #238749; font-weight: 500;">Giriş</span>';
  } else if (value === 1 || value === '1' || value === true || value === 'Çıkış') {
    return '<span style="color: #c91818; font-weight: 500;">Çıkış</span>';
  }
  return '';
}

export const tableColumns: TableColumn[] = [
  { 
    field: 'EmployeeID', 
    label: 'ID', 
    text: 'ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    min: 20,
    searchable: 'int',
    resizable: true,
    tooltip: 'Employee ID'
  },
  { 
    field: 'PictureID', 
    label: 'Resim', 
    text: 'Resim',
    type: 'picture' as ColumnType, 
    sortable: false, 
    width: '80px', 
    size: '80px',
    min: 20,
    searchable: false,
    resizable: true,
    align: 'center',
    prependUrl: `${apiUrl}/images/{0}`,
    tooltip: 'Picture'
  },
  { 
    field: 'IdentificationNumber', 
    label: 'TC Kimlik', 
    text: 'TC Kimlik',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px',
    size: '120px',
    min: 20,
    searchable: 'text',
    resizable: true,
    tooltip: 'Identification Number'
  },
  { 
    field: 'Name', 
    label: 'Ad', 
    text: 'Ad',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px',
    size: '120px',
    min: 20,
    searchable: 'text',
    resizable: true,
    tooltip: 'First Name'
  },
  { 
    field: 'SurName', 
    label: 'Soyad', 
    text: 'Soyad',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px',
    size: '120px',
    min: 20,
    searchable: 'text',
    resizable: true,
    tooltip: 'Last Name'
  },
  { 
    field: 'Mail', 
    label: 'E-posta', 
    text: 'E-posta',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px',
    size: '200px',
    min: 20,
    searchable: 'text',
    resizable: true,
    tooltip: 'Email Address'
  },
  { 
    field: 'MobilePhone1', 
    label: 'Cep Telefonu', 
    text: 'Cep Telefonu',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px',
    size: '150px',
    min: 20,
    searchable: 'text',
    resizable: true,
    tooltip: 'Mobile Phone'
  },
  { 
    field: 'EmployeeDepartments.Department.DepartmentName', 
    label: 'Departman', 
    text: 'Departman',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text',
    resizable: true,
    render: (record: TableRow) => {
      const departments = record['EmployeeDepartments'];
      if (departments && Array.isArray(departments) && departments.length > 0) {
        return departments.map((ed: any) => ed['Department']?.['DepartmentName']).filter(Boolean).join(', ') || '';
      }
      return '';
    }
  },
  { 
    field: 'EmployeeLastAccessEvent.AccessEventID', 
    label: 'Olay ID', 
    text: 'Olay ID',
    type: 'int' as ColumnType, 
    sortable: false, 
    width: '100px', 
    size: '100px',
    min: 20,
    searchable: 'int',
    resizable: true,
    render: (record: TableRow) => {
      const accessEvent = record['EmployeeLastAccessEvent'];
      return accessEvent?.['AccessEventID'] || '';
    }
  },
  { 
    field: 'EmployeeLastAccessEvent.Location', 
    label: 'Son Konum', 
    text: 'Son Konum',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text',
    resizable: true,
    render: (record: TableRow) => {
      const accessEvent = record['EmployeeLastAccessEvent'];
      return accessEvent?.['Location'] || '';
    }
  },
  { 
    field: 'EmployeeLastAccessEvent.DeviceSerial', 
    label: 'Cihaz Seri No', 
    text: 'Cihaz Seri No',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text',
    resizable: true,
    render: (record: TableRow) => {
      const accessEvent = record['EmployeeLastAccessEvent'];
      return accessEvent?.['DeviceSerial'] || '';
    }
  },
  { 
    field: 'EmployeeLastAccessEvent.TagCode', 
    label: 'Tag Kodu', 
    text: 'Tag Kodu',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text',
    resizable: true,
    render: (record: TableRow) => {
      const accessEvent = record['EmployeeLastAccessEvent'];
      return accessEvent?.['TagCode'] || '';
    }
  },
  { 
    field: 'EmployeeLastAccessEvent.inOUT', 
    label: 'Son Yön', 
    text: 'Son Yön',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '100px', 
    size: '100px',
    min: 20,
    searchable: 'text',
    resizable: true,
    render: renderInOut
  },
  { 
    field: 'EmployeeLastAccessEvent.EventTime', 
    label: 'Son Olay Zamanı', 
    text: 'Son Olay Zamanı',
    type: 'datetime' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'datetime',
    resizable: true,
    render: (record: TableRow) => {
      const accessEvent = record['EmployeeLastAccessEvent'];
      if (!accessEvent || !accessEvent['EventTime']) return '';
      
      const eventTime = accessEvent['EventTime'];
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
    field: 'EmployeeLastAccessEvent.RecordTime', 
    label: 'Son Kayıt Zamanı', 
    text: 'Son Kayıt Zamanı',
    type: 'datetime' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'datetime',
    resizable: true,
    render: (record: TableRow) => {
      const accessEvent = record['EmployeeLastAccessEvent'];
      if (!accessEvent || !accessEvent['RecordTime']) return '';
      
      const recordTime = accessEvent['RecordTime'];
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
    field: 'EmployeeLastAccessEvent.EventDesc', 
    label: 'Son Olay Açıklaması', 
    text: 'Son Olay Açıklaması',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text',
    resizable: true,
    render: (record: TableRow) => {
      const accessEvent = record['EmployeeLastAccessEvent'];
      return accessEvent?.['EventDesc'] || '';
    }
  },
  { 
    field: 'EmployeeLastAccessEvent.EventSource', 
    label: 'Olay Kaynağı', 
    text: 'Olay Kaynağı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text',
    resizable: true,
    render: (record: TableRow) => {
      const accessEvent = record['EmployeeLastAccessEvent'];
      return accessEvent?.['EventSource'] || '';
    }
  },
  { 
    field: 'EmployeeLastAccessEvent.isOffline', 
    label: 'Offline', 
    text: 'Offline',
    type: 'checkbox' as ColumnType, 
    sortable: false, 
    width: '80px', 
    size: '80px',
    min: 20,
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'EmployeeLastAccessEvent.isPdks', 
    label: 'Puantaj', 
    text: 'Puantaj',
    type: 'checkbox' as ColumnType, 
    sortable: false, 
    width: '80px', 
    size: '80px',
    min: 20,
    searchable: 'checkbox',
    resizable: true
  }
];
