// AccessDetails table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

export const tableColumns: TableColumn[] = [
  { 
    field: 'Company', 
    searchField: 'Company.PdksCompanyName',
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
        return (data?.records || []).map((item: any) => ({
          id: item?.PdksCompanyName ?? item?.CompanyName ?? item?.Name ?? '',
          text: item?.PdksCompanyName ?? item?.CompanyName ?? item?.Name ?? ''
        }));
      }
    },
    render: (record: TableRow) => {
      return record['Company']?.PdksCompanyName || '';
    }
  },
  { 
    field: 'Kadro', 
    searchField: 'Kadro.Name',
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
        return (data?.records || []).map((item: any) => ({
          id: item?.Name ?? '',
          text: item?.Name ?? ''
        }));
      }
    },
    render: (record: TableRow) => {
      return record['Kadro']?.Name || '';
    }
  },
  { 
    field: 'Department', 
    searchField: 'EmployeeDepartments.Department.DepartmentName',
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
        return (data?.records || []).map((item: any) => ({
          id: item?.DepartmentName ?? item?.Name ?? '',
          text: item?.DepartmentName ?? item?.Name ?? ''
        }));
      }
    },
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
    field: 'cardOwnerName', 
    label: 'Kart Sahibi', 
    text: 'Kart Sahibi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      // Try to get card owner name from Cards array
      if (record['Cards'] && Array.isArray(record['Cards']) && record['Cards'].length > 0) {
        const firstCard = record['Cards'][0];
        // Try different possible field names for card owner
        return firstCard['OwnerName'] || 
               firstCard['CardOwnerName'] || 
               firstCard['Owner']?.Name || 
               firstCard['CardOwner']?.Name ||
               (firstCard['Owner'] && typeof firstCard['Owner'] === 'string' ? firstCard['Owner'] : '') ||
               '';
      }
      // Fallback: try direct field access
      return record['cardOwnerName'] || 
             record['CardOwnerName'] || 
             record['OwnerName'] || 
             '';
    }
  },
  { 
    field: 'AccessGroup', 
    searchField: 'EmployeeAccessGroups.AccessGroup.AccessGroupName',
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
        return (data?.records || []).map((item: any) => ({
          id: item?.AccessGroupName ?? item?.Name ?? '',
          text: item?.AccessGroupName ?? item?.Name ?? ''
        }));
      }
    },
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
          const name = item?.ReaderName ?? item?.Name ?? item?.DoorName ?? '';
          return { id: name, text: name || '(boş)' };
        });
      }
    },
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
