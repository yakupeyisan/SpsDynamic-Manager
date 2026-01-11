// InputOutputReports table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

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

export const tableColumns: TableColumn[] = [
  { 
    field: 'EventID', 
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
    field: 'Employee.Name', 
    label: 'Personel Adı', 
    text: 'Personel Adı',
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
        return `${employee['Name'] || ''} ${employee['SurName'] || ''}`.trim();
      }
      return '';
    }
  },
  { 
    field: 'Employee.Company', 
    label: 'Firma', 
    text: 'Firma',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const employee = record['Employee'];
      return employee?.Company?.PdksCompanyName || '';
    }
  },
  { 
    field: 'Employee.Department', 
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
      const employee = record['Employee'];
      if (employee?.EmployeeDepartments && Array.isArray(employee.EmployeeDepartments) && employee.EmployeeDepartments.length > 0) {
        return employee.EmployeeDepartments.map((ed: any) => ed.Department?.DepartmentName).filter(Boolean).join(', ') || '';
      }
      return '';
    }
  },
  { 
    field: 'Employee.Kadro', 
    label: 'Kadro', 
    text: 'Kadro',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const employee = record['Employee'];
      return employee?.Kadro?.Name || '';
    }
  },
  { 
    field: 'Employee.AccessGroup', 
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
      const employee = record['Employee'];
      if (employee?.EmployeeAccessGroups && Array.isArray(employee.EmployeeAccessGroups) && employee.EmployeeAccessGroups.length > 0) {
        return employee.EmployeeAccessGroups.map((eag: any) => eag.AccessGroup?.AccessGroupName).filter(Boolean).join(', ') || '';
      }
      return '';
    }
  },
  { 
    field: 'Date', 
    label: 'Tarih', 
    text: 'Tarih',
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
  { 
    field: 'Time', 
    label: 'Saat', 
    text: 'Saat',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
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
    label: 'Konum', 
    text: 'Konum',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
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
    field: 'CardCode', 
    label: 'Kart Kodu', 
    text: 'Kart Kodu',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'FacilityCode', 
    label: 'Tesis Kodu', 
    text: 'Tesis Kodu',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  }
];
