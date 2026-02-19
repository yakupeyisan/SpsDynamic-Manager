// Employee table columns configuration from old app.component.ts
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Data Table - Adapted for Employees API
export const tableColumns: TableColumn[] = [
  { 
    field: 'EmployeeID', 
    label: 'ID', 
    text: 'ID',
    type: 'int', 
    sortable: true, 
    width: '80px', 
    size: '80px',
    searchable: 'int',
    resizable: true,
    tooltip: 'Employee ID'
  },
  { 
    field: 'ReferanceID', 
    label: 'Referans ID', 
    text: 'Referans ID',
    type: 'int', 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: 'int',
    resizable: true,
    tooltip: 'Referance ID'
  },
  { 
    field: 'PictureID', 
    label: 'Resim', 
    text: 'Resim',
    type: 'picture', 
    sortable: false, 
    width: '80px', 
    size: '80px',
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
    type: 'text', 
    sortable: true, 
    width: '120px',
    size: '120px',
    searchable: 'text',
    resizable: true,
    tooltip: 'Identification Number'
  },
  { 
    field: 'Company', 
    searchField: 'Company.PdksCompanyID',
    label: 'Firma', 
    text: 'Firma',
    type: 'enum',
    sortable: false, 
    searchable: 'enum',
    resizable: true,
    tooltip: 'Company',
    joinTable: 'Company',
    hidden: true,
    load: {
      url: `${apiUrl}/api/PdksCompanys`,
      injectAuth: true,
      method: 'POST' as const,
      data: {
        limit: -1,
        offset: 0
      },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.PdksCompanyID,
          text: item.PdksCompanyName
        }));
      }
    },
    render: (record: any) => {
      return record.Company?.PdksCompanyName || '';
    }
  },
  { 
    field: 'Kadro', 
    searchField: 'Kadro.ID',
    label: 'Kadro', 
    text: 'Kadro',
    type: 'enum',
    sortable: false, 
    searchable: 'enum',
    resizable: true,
    tooltip: 'Kadro',
    joinTable: 'Kadro',
    hidden: true,
    load: {
      url: `${apiUrl}/api/PdksStaffs`,
      injectAuth: true,
      method: 'POST' as const,
      data: {
        limit: -1,
        offset: 0
      },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.ID,
          text: item.Name
        }));
      }
    },
    render: (record: any) => {
      return record.Kadro?.Name || '';
    }
  },
  { 
    field: 'Department', 
    searchField: 'EmployeeDepartments.Department.DepartmentID',
    load: {
      url: `${apiUrl}/api/Departments`,
      injectAuth: true,
      method: 'POST' as const,
      data: {
        limit: -1,
        offset: 0
      },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.DepartmentID,
          text: item.DepartmentName
        }));
      }
    },
    label: 'Departman', 
    text: 'Departman',
    type: 'enum', 
    sortable: false, 
    searchable: 'enum',
    resizable: true,
    tooltip: 'Department',
    joinTable: 'Department',
    hidden: true,
    render: (record: any) => {
      if (record.EmployeeDepartments && record.EmployeeDepartments.length > 0) {
        return record.EmployeeDepartments.map((ed: any) => ed.Department?.DepartmentName).filter(Boolean).join(', ') || '';
      }
      return '';
    }
  },
  { 
    field: 'AccessGroup', 
    searchField: 'EmployeeAccessGroups.AccessGroup.AccessGroupID',
    label: 'Erişim Grubu', 
    text: 'Erişim Grubu',
    type: 'enum',
    sortable: false, 
    searchable: 'enum',
    resizable: true,
    tooltip: 'Access Group',
    joinTable: 'AccessGroup',
    hidden: true,
    load: {
      url: `${apiUrl}/api/AccessGroups`,
      injectAuth: true,
      method: 'POST' as const,
      data: {
        limit: -1,
        offset: 0
      },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.AccessGroupID || item.Id,
          text: item.AccessGroupName || item.Name
        }));
      }
    },
    render: (record: any) => {
      if (record.EmployeeAccessGroups && record.EmployeeAccessGroups.length > 0) {
        return record.EmployeeAccessGroups.map((eag: any) => eag.AccessGroup?.AccessGroupName).filter(Boolean).join(', ') || '';
      }
      return '';
    }
  },
  { 
    field: 'Name', 
    label: 'Ad', 
    text: 'Ad',
    type: 'text', 
    sortable: true, 
    searchable: 'text',
    resizable: true,
    tooltip: 'First Name'
  },
  { 
    field: 'SurName', 
    label: 'Soyad', 
    text: 'Soyad',
    type: 'text', 
    sortable: true, 
    searchable: 'text',
    resizable: true,
    tooltip: 'Last Name'
  },
  { 
    field: 'Mail', 
    label: 'E-posta', 
    text: 'E-posta',
    type: 'text', 
    sortable: true, 
    searchable: 'text',
    resizable: true,
    tooltip: 'Email Address'
  },
  { 
    field: 'MobilePhone1', 
    label: 'Cep Telefonu 1', 
    text: 'Cep Telefonu 1',
    type: 'text', 
    sortable: true, 
    searchable: 'text',
    resizable: true,
    tooltip: 'Mobile Phone 1'
  },
  { 
    field: 'MobilePhone2', 
    label: 'Cep Telefonu 2', 
    text: 'Cep Telefonu 2',
    type: 'text', 
    sortable: true, 
    searchable: 'text',
    resizable: true,
    tooltip: 'Mobile Phone 2'
  },
  { 
    field: 'Address', 
    label: 'Adres', 
    text: 'Adres',
    type: 'text', 
    sortable: true, 
    searchable: 'text',
    resizable: true,
    tooltip: 'Address'
  },
  { 
    field: 'City', 
    label: 'Şehir', 
    text: 'Şehir',
    type: 'text', 
    sortable: true, 
    searchable: 'text',
    resizable: true,
    tooltip: 'City'
  },
  { 
    field: 'Gender', 
    label: 'Cinsiyet', 
    text: 'Cinsiyet',
    type: 'list', 
    sortable: true, 
    align: 'center',
    searchable: 'list',
    resizable: true,
    tooltip: 'Gender',
    options: [
      { label: 'Erkek', value: 'M' },
      { label: 'Kadın', value: 'F' }
    ]
  },
  { 
    field: 'CafeteriaStatus', 
    label: 'Kafeterya Durumu', 
    text: 'Kafeterya Durumu',
    type: 'checkbox', 
    sortable: true, 
    align: 'center',
    searchable: 'checkbox',
    resizable: true,
    tooltip: 'Cafeteria Status'
  },
  { 
    field: 'WebClient', 
    label: 'Web İstemci', 
    text: 'Web İstemci',
    type: 'checkbox', 
    sortable: true, 
    align: 'center',
    searchable: 'checkbox',
    resizable: true,
    tooltip: 'Web Client Access'
  },
  { 
    field: 'WebAdmin', 
    label: 'Web Admin', 
    text: 'Web Admin',
    type: 'checkbox', 
    sortable: true, 
    align: 'center',
    searchable: 'checkbox',
    resizable: true,
    tooltip: 'Web Admin Access'
  },
  { 
    field: 'WebClientAuthorizationId', 
    label: 'Web İstemci Yetki', 
    text: 'Web İstemci Yetki',
    type: 'list',
    sortable: false, 
    searchable: 'text',
    resizable: true,
    tooltip: 'Web Client Authorization',
    joinTable: 'WebClient',
    hidden: true,
    load: {
      url: `${apiUrl}/api/Authorizations`,
      injectAuth: true,
      method: 'POST' as const,
      data: {
        limit: -1,
        offset: 0
      },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.Id,
          text: item.Name
        }));
      }
    },
    render: (record: any) => {
      return record.WebClientAuthorization?.Name || '';
    }
  },
  { 
    field: 'AuthorizationId', 
    label: 'Yetki', 
    text: 'Yetki',
    type: 'list',
    sortable: false, 
    searchable: 'text',
    resizable: true,
    tooltip: 'Authorization',
    joinTable: 'WebAdmin',
    hidden: true,
    load: {
      url: `${apiUrl}/api/Authorizations`,
      injectAuth: true,
      method: 'POST' as const,
      data: {
        limit: -1,
        offset: 0
      },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.Id,
          text: item.Name
        }));
      }
    },
    render: (record: any) => {
      return record.Authorization?.Name || '';
    }
  },
  { 
    field: 'Banned', 
    label: 'Yasaklı', 
    text: 'Yasaklı',
    type: 'checkbox', 
    sortable: true, 
    align: 'center',
    searchable: 'checkbox',
    resizable: true,
    tooltip: 'Banned Status'
  },
  { 
    field: 'IsVisitor', 
    label: 'Ziyaretçi', 
    text: 'Ziyaretçi',
    type: 'checkbox', 
    sortable: true, 
    align: 'center',
    searchable: 'checkbox',
    resizable: true,
    tooltip: 'Is Visitor'
  },
  { 
    field: 'Antipassback', 
    label: 'Antipassback', 
    text: 'Antipassback',
    type: 'checkbox', 
    sortable: true, 
    align: 'center',
    searchable: 'checkbox',
    resizable: true,
    tooltip: 'Antipassback'
  },
  { 
    field: 'LastPasswordUpdate', 
    label: 'Son Şifre Güncelleme', 
    text: 'Son Şifre Güncelleme',
    type: 'datetime', 
    sortable: true, 
    searchable: 'date',
    resizable: true,
    tooltip: 'Last Password Update'
  },
  { 
    field: 'Notes', 
    label: 'Notlar', 
    text: 'Notlar',
    type: 'text', 
    sortable: true, 
    searchable: 'text',
    resizable: true,
    tooltip: 'Notes'
  },
  // CustomField01-20
  ...Array.from({ length: 20 }, (_, i) => ({
    field: `CustomField${String(i + 1).padStart(2, '0')}`,
    searchField: `CustomField.CustomField${String(i + 1).padStart(2, '0')}`,
    label: `Özel Alan ${i + 1}`,
    text: `Özel Alan ${i + 1}`,
    type: 'text' as ColumnType,
    sortable: true,
    searchable: 'text' as const,
    resizable: true,
    tooltip: `Custom Field ${i + 1}`,
    joinTable: 'CustomField',
    hidden: true,
    render: (record: any) => {
      return record.CustomField?.[`CustomField${String(i + 1).padStart(2, '0')}`] || '';
    }
  }))
];
