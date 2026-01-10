// EmployeeTransferList table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  { 
    field: 'Id', 
    label: 'ID', 
    text: 'ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    min: 20,
    searchable: 'int',
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
    searchable: 'text',
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
    searchable: 'text',
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
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'Company.Name', 
    label: 'Şirket', 
    text: 'Şirket',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text',
    resizable: true,
    render: (record: TableRow) => {
      const company = record['Company'];
      return company?.['Name'] || '';
    }
  },
  { 
    field: 'Department.DepartmentName', 
    label: 'Departman', 
    text: 'Departman',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text',
    resizable: true,
    render: (record: TableRow) => {
      const department = record['Department'];
      return department?.['DepartmentName'] || '';
    }
  },
  { 
    field: 'Gender', 
    label: 'Cinsiyet', 
    text: 'Cinsiyet',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '80px',
    size: '80px',
    min: 20,
    searchable: 'text',
    resizable: true
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
    resizable: true
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
    resizable: true
  },
  { 
    field: 'Address', 
    label: 'Adres', 
    text: 'Adres',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '250px',
    size: '250px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'City', 
    label: 'Şehir', 
    text: 'Şehir',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '100px',
    size: '100px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'WebClient', 
    label: 'Web İstemci', 
    text: 'Web İstemci',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    min: 20,
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'WebAdmin', 
    label: 'Web Admin', 
    text: 'Web Admin',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    min: 20,
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'Banned', 
    label: 'Yasaklı', 
    text: 'Yasaklı',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    min: 20,
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'BannedMsg', 
    label: 'Yasak Mesajı', 
    text: 'Yasak Mesajı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px',
    size: '200px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'CafeteriaStatus', 
    label: 'Kafeterya Durumu', 
    text: 'Kafeterya Durumu',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px',
    size: '120px',
    min: 20,
    searchable: 'text',
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
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'Plate', 
    label: 'Plaka', 
    text: 'Plaka',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '100px',
    size: '100px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'CardUID', 
    label: 'Kart UID', 
    text: 'Kart UID',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px',
    size: '150px',
    min: 20,
    searchable: 'text',
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
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'CardCodeType', 
    label: 'Kart Kodu Tipi', 
    text: 'Kart Kodu Tipi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px',
    size: '120px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'Status', 
    label: 'Durum', 
    text: 'Durum',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '100px',
    size: '100px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'isDelete', 
    label: 'Silindi', 
    text: 'Silindi',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    min: 20,
    searchable: 'checkbox',
    resizable: true
  },
  // CustomField01-20 (hidden by default)
  ...Array.from({ length: 20 }, (_, i) => ({
    field: `CustomField${String(i + 1).padStart(2, '0')}`,
    label: `Özel Alan ${i + 1}`,
    text: `Özel Alan ${i + 1}`,
    type: 'text' as ColumnType,
    sortable: true,
    width: '150px',
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    hidden: true
  }))
];
