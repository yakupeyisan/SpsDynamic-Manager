// InsideOutsideReports table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

export const tableColumns: TableColumn[] = [
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
    field: 'IdentificationNumber', 
    label: 'TC Kimlik', 
    text: 'TC Kimlik',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
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
    searchable: 'text' as ColumnType,
    resizable: true
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
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'EmployeeDepartments', 
    searchField: 'EmployeeDepartments.Department.DepartmentName',
    label: 'Departman', 
    text: 'Departman',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      if (record['EmployeeDepartments'] && Array.isArray(record['EmployeeDepartments']) && record['EmployeeDepartments'].length > 0) {
        return record['EmployeeDepartments']
          .map((ed: any) => ed['Department']?.DepartmentName)
          .filter(Boolean)
          .join(', ') || '';
      }
      return '';
    }
  },
  { 
    field: 'EmployeeLastAccessEvent.inOUT', 
    label: 'Durum', 
    text: 'Durum',
    type: 'list' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'list' as ColumnType,
    resizable: true,
    options: [
      { label: 'İçerde', value: 0 },
      { label: 'Dışarıda', value: 1 }
    ],
    render: (record: TableRow) => {
      const lastEvent = record['EmployeeLastAccessEvent'];
      if (!lastEvent) return '';
      const inOut = lastEvent['inOUT'];
      // "0" = Giriş (İçeride), "1" = Çıkış (Dışarıda)
      if (inOut === '0' || inOut === 0) {
        return 'İçerde';
      } else if (inOut === '1' || inOut === 1) {
        return 'Dışarıda';
      }
      return '';
    }
  },
  { 
    field: 'EmployeeLastAccessEvent.EventTime', 
    label: 'Son Geçiş Zamanı', 
    text: 'Son Geçiş Zamanı',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'datetime' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const lastEvent = record['EmployeeLastAccessEvent'];
      if (!lastEvent || !lastEvent['EventTime']) return '';
      const dateTime = lastEvent['EventTime'];
      if (dateTime instanceof Date || (typeof dateTime === 'string' && dateTime.length > 0)) {
        const dateObj = new Date(dateTime);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toLocaleString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        }
      }
      return String(dateTime || '');
    }
  },
  { 
    field: 'EmployeeLastAccessEvent.Location', 
    label: 'Son Geçiş Konumu', 
    text: 'Son Geçiş Konumu',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const lastEvent = record['EmployeeLastAccessEvent'];
      return lastEvent?.Location || '';
    }
  },
  { 
    field: 'EmployeeAccessGroups', 
    searchField: 'EmployeeAccessGroups.AccessGroup.AccessGroupName',
    label: 'Geçiş Yetkisi', 
    text: 'Geçiş Yetkisi',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      if (record['EmployeeAccessGroups'] && Array.isArray(record['EmployeeAccessGroups']) && record['EmployeeAccessGroups'].length > 0) {
        return record['EmployeeAccessGroups']
          .map((eag: any) => eag['AccessGroup']?.AccessGroupName || eag['AccessGroup']?.Name)
          .filter(Boolean)
          .join(', ') || '';
      }
      return '';
    }
  }
];
