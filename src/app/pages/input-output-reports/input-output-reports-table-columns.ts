// InputOutputReports table columns configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, TableRow, TableColumnGroup } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Helper function to get first entry event from InEvent array
function getFirstEntry(record: TableRow): any {
  const inEvents = record['InEvent'];
  if (Array.isArray(inEvents) && inEvents.length > 0) {
    // Sort by Date and Time to get the earliest entry
    const sorted = [...inEvents].sort((a: any, b: any) => {
      const dateA = new Date(`${a.Date || ''} ${a.Time || ''}`).getTime();
      const dateB = new Date(`${b.Date || ''} ${b.Time || ''}`).getTime();
      return dateA - dateB;
    });
    return sorted[0];
  }
  return null;
}

// Helper function to get last exit event from OutEvent array
function getLastExit(record: TableRow): any {
  const outEvents = record['OutEvent'];
  if (Array.isArray(outEvents) && outEvents.length > 0) {
    // Sort by Date and Time to get the latest exit
    const sorted = [...outEvents].sort((a: any, b: any) => {
      const dateA = new Date(`${a.Date || ''} ${a.Time || ''}`).getTime();
      const dateB = new Date(`${b.Date || ''} ${b.Time || ''}`).getTime();
      return dateB - dateA;
    });
    return sorted[0];
  }
  return null;
}

export const tableColumns: TableColumn[] = [
  // Kişi Bilgileri Group (8 columns)
  { 
    field: 'EmployeeID', 
    label: 'Personel ID', 
    text: 'Personel ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true
  },
  { 
    field: 'Employee.PictureID', 
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
    render: (record: TableRow) => {
      const employee = record['Employee'];
      return employee?.PictureID || '';
    }
  },
  { 
    field: 'Employee.IdentificationNumber', 
    label: 'TC Kimlik', 
    text: 'TC Kimlik',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const employee = record['Employee'];
      return employee?.IdentificationNumber || '';
    }
  },
  { 
    field: 'Employee.Name', 
    label: 'Ad', 
    text: 'Ad',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const employee = record['Employee'];
      return employee?.Name || '';
    }
  },
  { 
    field: 'Employee.SurName', 
    label: 'Soyad', 
    text: 'Soyad',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const employee = record['Employee'];
      return employee?.SurName || '';
    }
  },
  { 
    field: 'Employee.EmployeeDepartments', 
    label: 'Departman', 
    text: 'Departman',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    exportDisplayField: 'Employee.EmployeeDepartments.Department.DepartmentName',
    render: (record: TableRow) => {
      const employee = record['Employee'];
      if (employee?.EmployeeDepartments && Array.isArray(employee.EmployeeDepartments) && employee.EmployeeDepartments.length > 0) {
        return employee.EmployeeDepartments.map((ed: any) => ed.Department?.DepartmentName).filter(Boolean).join(', ') || '';
      }
      return '';
    }
  },
  { 
    field: 'Employee.EmployeeAccessGroups', 
    label: 'Geçiş Yetkisi', 
    text: 'Geçiş Yetkisi',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    exportDisplayField: 'Employee.EmployeeAccessGroups.AccessGroup.AccessGroupName',
    render: (record: TableRow) => {
      const employee = record['Employee'];
      if (employee?.EmployeeAccessGroups && Array.isArray(employee.EmployeeAccessGroups) && employee.EmployeeAccessGroups.length > 0) {
        return employee.EmployeeAccessGroups.map((eag: any) => eag.AccessGroup?.AccessGroupName).filter(Boolean).join(', ') || '';
      }
      return '';
    }
  },
  { 
    field: 'Date', 
    label: 'Rapor Tarihi', 
    text: 'Rapor Tarihi',
    type: 'date' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'date' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      if (!record['Date']) return '';
      const date = record['Date'];
      if (date instanceof Date || (typeof date === 'string' && date.length > 0)) {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        }
      }
      return String(date || '');
    }
  },
  // Giriş Kayıtları Group (5 columns)
  { 
    field: 'InEvent.Location', 
    label: 'Konum', 
    text: 'Konum',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: false,
    resizable: true,
    render: (record: TableRow) => {
      const firstEntry = getFirstEntry(record);
      return firstEntry?.Location || '';
    }
  },
  { 
    field: 'InEvent.Time', 
    label: 'Saat', 
    text: 'Saat',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '100px', 
    size: '100px',
    min: 20,
    searchable: false,
    resizable: true,
    render: (record: TableRow) => {
      const firstEntry = getFirstEntry(record);
      return firstEntry?.Time || '';
    }
  },
  { 
    field: 'InEvent.TagCode', 
    label: 'Tag Kodu', 
    text: 'Tag Kodu',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    render: (record: TableRow) => {
      const firstEntry = getFirstEntry(record);
      return firstEntry?.TagCode || '';
    }
  },
  { 
    field: 'InEvent.FacilityCode', 
    label: 'Tesis Kodu', 
    text: 'Tesis Kodu',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    render: (record: TableRow) => {
      const firstEntry = getFirstEntry(record);
      return firstEntry?.FacilityCode || '';
    }
  },
  { 
    field: 'InEvent.CardCode', 
    label: 'Kart Kodu', 
    text: 'Kart Kodu',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    render: (record: TableRow) => {
      const firstEntry = getFirstEntry(record);
      return firstEntry?.CardCode || '';
    }
  },
  // Çıkış Kayıtları Group (5 columns)
  { 
    field: 'OutEvent.Location', 
    label: 'Konum', 
    text: 'Konum',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: false,
    resizable: true,
    render: (record: TableRow) => {
      const lastExit = getLastExit(record);
      return lastExit?.Location || '';
    }
  },
  { 
    field: 'OutEvent.Time', 
    label: 'Saat', 
    text: 'Saat',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '100px', 
    size: '100px',
    min: 20,
    searchable: false,
    resizable: true,
    render: (record: TableRow) => {
      const lastExit = getLastExit(record);
      return lastExit?.Time || '';
    }
  },
  { 
    field: 'OutEvent.TagCode', 
    label: 'Tag Kodu', 
    text: 'Tag Kodu',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    render: (record: TableRow) => {
      const lastExit = getLastExit(record);
      return lastExit?.TagCode || '';
    }
  },
  { 
    field: 'OutEvent.FacilityCode', 
    label: 'Tesis Kodu', 
    text: 'Tesis Kodu',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    render: (record: TableRow) => {
      const lastExit = getLastExit(record);
      return lastExit?.FacilityCode || '';
    }
  },
  { 
    field: 'OutEvent.CardCode', 
    label: 'Kart Kodu', 
    text: 'Kart Kodu',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    render: (record: TableRow) => {
      const lastExit = getLastExit(record);
      return lastExit?.CardCode || '';
    }
  }
];

export const columnGroups: TableColumnGroup[] = [
  { span: 8, text: 'Kişi Bilgileri' },
  { span: 5, text: 'Giriş Kayıtları' },
  { span: 5, text: 'Çıkış Kayıtları' }
];
