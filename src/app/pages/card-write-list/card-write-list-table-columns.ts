// CardWriteList table columns configuration
import { TableColumn, ColumnType } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  { 
    field: 'Id', 
    label: 'ID', 
    text: 'ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '40px', 
    size: '40px',
    searchable: 'int',
    resizable: true,
    min: 20
  },
  { 
    field: 'TemplateName', 
    label: 'Şablon Adı', 
    text: 'Şablon Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'text',
    resizable: true,
    min: 20,
    render: (record: any) => record.CardTemplate?.Name || record.CardTemplate?.TemplateName || record.TemplateName || '',
    joinTable: 'CardTemplate'
  },
  { 
    field: 'DepartmentName', 
    label: 'Bölüm', 
    text: 'Bölüm',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true,
    min: 20,
    render: (record: any) => {
      if (record.Card?.Employee?.EmployeeDepartments && Array.isArray(record.Card.Employee.EmployeeDepartments) && record.Card.Employee.EmployeeDepartments.length > 0) {
        const dept = record.Card.Employee.EmployeeDepartments[0]?.Department;
        return dept?.DepartmentName || dept?.Name || '';
      }
      if (record.Card?.Employee?.Department) {
        return record.Card.Employee.Department.DepartmentName || record.Card.Employee.Department.Name || '';
      }
      return record.DepartmentName || '';
    },
    joinTable: 'Card'
  },
  { 
    field: 'EmployeeID', 
    label: 'Kişi No', 
    text: 'Kişi No',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '60px', 
    size: '60px',
    searchable: 'int',
    resizable: true,
    min: 20,
    render: (record: any) => record.Card?.Employee?.EmployeeID || record.Card?.EmployeeID || record.EmployeeID || '',
    joinTable: 'Card'
  },
  { 
    field: 'IdentificationNumber', 
    label: 'Kimlik Numarası', 
    text: 'Kimlik Numarası',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true,
    min: 20,
    render: (record: any) => record.Card?.Employee?.IdentificationNumber || record.Card?.Employee?.TCKimlikNo || record.Card?.Employee?.IdentityNumber || record.IdentificationNumber || '',
    joinTable: 'Card'
  },
  { 
    field: 'Name', 
    label: 'Adı', 
    text: 'Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'text',
    resizable: true,
    min: 20,
    render: (record: any) => record.Card?.Employee?.Name || record.Name || '',
    joinTable: 'Card'
  },
  { 
    field: 'SurName', 
    label: 'Soyad', 
    text: 'Soyad',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'text',
    resizable: true,
    min: 20,
    render: (record: any) => record.Card?.Employee?.SurName || record.SurName || '',
    joinTable: 'Card'
  },
  { 
    field: 'TagCode', 
    label: 'Kart No', 
    text: 'Kart No',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true,
    min: 20,
    render: (record: any) => record.Card?.TagCode || record.TagCode || '',
    joinTable: 'Card'
  },
  { 
    field: 'CardUID', 
    label: 'CardUID', 
    text: 'CardUID',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true,
    min: 20,
    render: (record: any) => record.Card?.CardUID || record.CardUID || '',
    joinTable: 'Card'
  },
  { 
    field: 'CardDesc', 
    label: 'Kart Açıklaması', 
    text: 'Kart Açıklaması',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true,
    min: 20,
    render: (record: any) => record.Card?.CardDesc || record.CardDesc || '',
    joinTable: 'Card'
  },
  { 
    field: 'CafeteriaGroupName', 
    label: 'Kafeterya Grup Adı', 
    text: 'Kafeterya Grup Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true,
    min: 20,
    render: (record: any) => record.Card?.CafeteriaGroup?.CafeteriaGroupName || record.Card?.CafeteriaGroup?.Name || record.CafeteriaGroupName || '',
    joinTable: 'Card'
  },
  { 
    field: 'CardUpdatedAt', 
    label: 'Kart Güncelleme Tarihi', 
    text: 'Kart Güncelleme Tarihi',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'datetime',
    resizable: true,
    min: 20,
    render: (record: any) => record.Card?.UpdatedAt || record.Card?.CardUpdatedAt || record.CardUpdatedAt || '',
    joinTable: 'Card'
  },
  { 
    field: 'WritedAt', 
    label: 'Yazdirma Tarihi', 
    text: 'Yazdirma Tarihi',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'datetime',
    resizable: true,
    min: 20
  },
  { 
    field: 'WritedUserName', 
    label: 'Yazdıran Kişi', 
    text: 'Yazdıran Kişi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: 'text',
    resizable: true,
    min: 20,
    render: (record: any) => {
      // Try to get user name from nested structure
      if (record.WritedUser) {
        // If it's an object with Name property
        if (typeof record.WritedUser === 'object' && record.WritedUser.Name) {
          return record.WritedUser.Name;
        }
        // If there's a User join
        if (record.User?.Name) {
          return record.User.Name;
        }
      }
      return record.WritedUserName || '';
    }
  },
  { 
    field: 'WritedData', 
    label: 'Yazdirilan Veri', 
    text: 'Yazdirilan Veri',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'text',
    resizable: true,
    min: 20
  }
];
