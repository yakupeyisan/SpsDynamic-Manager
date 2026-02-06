// AccessDetails table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

export const tableColumns: TableColumn[] = [
  { 
    field: 'Company', 
    searchField: 'Employee.Company.PdksCompanyID',
    label: 'Firma Adı', 
    text: 'Firma Adı',
    type: 'enum' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'enum' as ColumnType,
    resizable: true,
    load: {
      url: `${apiUrl}/api/PdksCompanys`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return (data?.records || []).map((item: any) => {
          const id = item?.PdksCompanyID ?? item?.CompanyID ?? item?.ID ?? '';
          const text = item?.PdksCompanyName ?? item?.CompanyName ?? item?.Name ?? '';
          return { id: String(id), text: text || '(boş)' };
        });
      }
    },
    render: (record: TableRow) => {
      return (record['Employee'] as any)?.Company?.PdksCompanyName ?? record['Company']?.PdksCompanyName ?? '';
    }
  },
  { 
    field: 'Kadro', 
    searchField: 'Employee.Kadro.PdksStaffID',
    label: 'Kadro Adı', 
    text: 'Kadro Adı',
    type: 'enum' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'enum' as ColumnType,
    resizable: true,
    load: {
      url: `${apiUrl}/api/PdksStaffs`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return (data?.records || []).map((item: any) => {
          const id = item?.PdksStaffID ?? item?.ID ?? '';
          const text = item?.Name ?? '';
          return { id: String(id), text: text || '(boş)' };
        });
      }
    },
    render: (record: TableRow) => {
      return (record['Employee'] as any)?.Kadro?.Name ?? record['Kadro']?.Name ?? '';
    }
  },
  { 
    field: 'Department', 
    searchField: 'Employee.EmployeeDepartments.Department.DepartmentID',
    label: 'Bölüm', 
    text: 'Bölüm',
    type: 'enum' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'enum' as ColumnType,
    resizable: true,
    load: {
      url: `${apiUrl}/api/Departments`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return (data?.records || []).map((item: any) => {
          const id = item?.DepartmentID ?? item?.ID ?? '';
          const text = item?.DepartmentName ?? item?.Name ?? '';
          return { id: String(id), text: text || '(boş)' };
        });
      }
    },
    render: (record: TableRow) => {
      const deps = (record['Employee'] as any)?.EmployeeDepartments ?? record['EmployeeDepartments'];
      if (deps && Array.isArray(deps) && deps.length > 0) {
        return deps
          .map((ed: any) => ed['Department']?.DepartmentName)
          .filter(Boolean)
          .join(', ') || '';
      }
      return '';
    }
  },
  { 
    field: 'Employee.IdentificationNumber', 
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
    field: 'Employee.Name', 
    searchField: 'Employee.Name',
    label: 'Adı', 
    text: 'Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => (record['Employee'] as any)?.Name ?? record['Name'] ?? ''
  },
  { 
    field: 'Employee.SurName', 
    searchField: 'Employee.SurName',
    label: 'Soyad', 
    text: 'Soyad',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => (record['Employee'] as any)?.SurName ?? record['SurName'] ?? ''
  },
  { 
    field: 'AccessGroupName', 
    searchField: 'AccessGroupID',
    label: 'Yetki Adı', 
    text: 'Yetki Adı',
    type: 'enum' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'enum' as ColumnType,
    resizable: true,
    load: {
      url: `${apiUrl}/api/AccessGroups`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return (data?.records || []).map((item: any) => {
          const id = item?.AccessGroupID ?? item?.ID ?? '';
          const text = item?.AccessGroupName ?? item?.Name ?? '';
          return { id: String(id), text: text || '(boş)' };
        });
      }
    },
    render: (record: TableRow) => {
      if (record['AccessGroupName'] != null && record['AccessGroupName'] !== '') {
        return String(record['AccessGroupName']);
      }
      const eag = (record['Employee'] as any)?.EmployeeAccessGroups;
      if (eag && Array.isArray(eag) && eag.length > 0) {
        return eag.map((x: any) => x['AccessGroup']?.AccessGroupName || x['AccessGroup']?.Name).filter(Boolean).join(', ') || '';
      }
      return '';
    }
  },
  { 
    field: 'ReaderName',
    searchField: 'ReaderID',
    label: 'Kapı', 
    text: 'Kapı',
    type: 'enum' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'enum' as ColumnType,
    resizable: true,
    load: {
      url: `${apiUrl}/api/Terminals`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        const records = data?.records ?? data?.data ?? (Array.isArray(data) ? data : []);
        return (records || []).map((item: any) => {
          const id = item?.ReaderID ?? item?.ID ?? item?.TerminalID ?? '';
          const name = item?.ReaderName ?? item?.Name ?? item?.DoorName ?? '';
          return { id: String(id), text: name || '(boş)' };
        });
      }
    },
    render: (record: TableRow) => {
      if (record['ReaderName'] != null && record['ReaderName'] !== '') {
        return String(record['ReaderName']);
      }
      if (record['EmployeeAccessGroups'] && Array.isArray(record['EmployeeAccessGroups'])) {
        const readers: string[] = [];
        (record['EmployeeAccessGroups'] as any[]).forEach((eag: any) => {
          const accessGroup = eag['AccessGroup'];
          if (accessGroup?.AccessGroupReaders && Array.isArray(accessGroup.AccessGroupReaders)) {
            accessGroup.AccessGroupReaders.forEach((agr: any) => {
              const terminal = agr['Terminal'];
              if (terminal) {
                const readerName = terminal['ReaderName'] || terminal['Name'];
                if (readerName && !readers.includes(readerName)) readers.push(readerName);
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
    field: 'TimeZoneName',
    searchField: 'TimeZoneID',
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
      if (record['TimeZoneName'] != null && record['TimeZoneName'] !== '') {
        return String(record['TimeZoneName']);
      }
      if (record['EmployeeAccessGroups'] && Array.isArray(record['EmployeeAccessGroups'])) {
        const timeZones: string[] = [];
        (record['EmployeeAccessGroups'] as any[]).forEach((eag: any) => {
          const accessGroup = eag['AccessGroup'];
          if (accessGroup?.AccessGroupReaders && Array.isArray(accessGroup.AccessGroupReaders)) {
            accessGroup.AccessGroupReaders.forEach((agr: any) => {
              const timeZone = agr['TimeZone'];
              if (timeZone) {
                const name = timeZone['TimeZoneName'] || timeZone['Name'];
                if (name && !timeZones.includes(name)) timeZones.push(name);
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
    searchField: 'Employee.CustomField.CustomField07',
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
      return (record['Employee'] as any)?.CustomField?.CustomField07 ?? record['CustomField']?.CustomField07 ?? '';
    }
  }
];
