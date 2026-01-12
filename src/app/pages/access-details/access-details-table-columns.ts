// AccessDetails table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

const apiUrl = environment.apiUrl;

export const tableColumns: TableColumn[] = [
  { 
    field: 'Company', 
    searchField: 'Company.PdksCompanyName',
    label: 'Firma Adı', 
    text: 'Firma Adı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      return record['Company']?.PdksCompanyName || '';
    }
  },
  { 
    field: 'Kadro', 
    searchField: 'Kadro.Name',
    label: 'Kadro Adı', 
    text: 'Kadro Adı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      return record['Kadro']?.Name || '';
    }
  },
  { 
    field: 'Department', 
    searchField: 'EmployeeDepartments.Department.DepartmentName',
    label: 'Bölüm', 
    text: 'Bölüm',
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
    field: 'IdentificationNumber', 
    label: 'Kimlik Numarası', 
    text: 'Kimlik Numarası',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '130px', 
    size: '130px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'Name', 
    label: 'Adı', 
    text: 'Adı',
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
    field: 'AccessGroup', 
    searchField: 'EmployeeAccessGroups.AccessGroup.AccessGroupName',
    label: 'Yetki Adı', 
    text: 'Yetki Adı',
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
  },
  { 
    field: 'Door', 
    searchField: 'EmployeeAccessGroups.AccessGroup.AccessGroupReaders.Terminal.ReaderName',
    label: 'Kapı', 
    text: 'Kapı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      // Try to get door/reader name from AccessGroupReaders
      if (record['EmployeeAccessGroups'] && Array.isArray(record['EmployeeAccessGroups'])) {
        const readers: string[] = [];
        record['EmployeeAccessGroups'].forEach((eag: any) => {
          const accessGroup = eag['AccessGroup'];
          if (accessGroup && accessGroup['AccessGroupReaders'] && Array.isArray(accessGroup['AccessGroupReaders'])) {
            accessGroup['AccessGroupReaders'].forEach((agr: any) => {
              const terminal = agr['Terminal'];
              if (terminal) {
                const readerName = terminal['ReaderName'] || terminal['Name'];
                if (readerName && !readers.includes(readerName)) {
                  readers.push(readerName);
                }
              }
            });
          }
        });
        return readers.join(', ') || '';
      }
      return '';
    }
  },
  { 
    field: 'TimeZone', 
    searchField: 'EmployeeAccessGroups.AccessGroup.AccessGroupReaders.TimeZone.TimeZoneName',
    label: 'Zaman Dilimi Adı', 
    text: 'Zaman Dilimi Adı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      // Try to get timezone name from AccessGroupReaders
      if (record['EmployeeAccessGroups'] && Array.isArray(record['EmployeeAccessGroups'])) {
        const timeZones: string[] = [];
        record['EmployeeAccessGroups'].forEach((eag: any) => {
          const accessGroup = eag['AccessGroup'];
          if (accessGroup && accessGroup['AccessGroupReaders'] && Array.isArray(accessGroup['AccessGroupReaders'])) {
            accessGroup['AccessGroupReaders'].forEach((agr: any) => {
              const timeZone = agr['TimeZone'];
              if (timeZone) {
                const timeZoneName = timeZone['TimeZoneName'] || timeZone['Name'];
                if (timeZoneName && !timeZones.includes(timeZoneName)) {
                  timeZones.push(timeZoneName);
                }
              }
            });
          }
        });
        return timeZones.join(', ') || '';
      }
      return '';
    }
  },
  { 
    field: 'CustomField07', 
    searchField: 'CustomField.CustomField07',
    label: 'Görevi', 
    text: 'Görevi',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      return record['CustomField']?.CustomField07 || '';
    }
  }
];
