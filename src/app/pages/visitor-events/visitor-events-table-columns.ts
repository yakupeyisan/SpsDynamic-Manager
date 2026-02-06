// VisitorEvents table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  // Ziyaretçi group
  { 
    field: 'VisitorEmployee.Name', 
    label: 'Ziyaretçi Adı', 
    text: 'Ziyaretçi Adı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    searchable: 'text' as ColumnType,
    resizable: true,
    joinTable: 'VisitorEmployee',
    render: (record: TableRow) => (record['VisitorEmployee'] as any)?.Name ?? ''
  },
  { 
    field: 'VisitorEmployee.SurName', 
    label: 'Ziyaretçi Soyadı', 
    text: 'Ziyaretçi Soyadı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    searchable: 'text' as ColumnType,
    resizable: true,
    joinTable: 'VisitorEmployee',
    render: (record: TableRow) => (record['VisitorEmployee'] as any)?.SurName ?? ''
  },
  { 
    field: 'VisitorCardID', 
    label: 'Ziyaretçi Kart ID', 
    text: 'Ziyaretçi Kart ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'VisitorCard.CardDesc', 
    label: 'Ziyaretçi Kart Açıklaması', 
    text: 'Ziyaretçi Kart Açıklaması',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '220px', 
    size: '220px',
    searchable: 'text',
    resizable: true,
    joinTable: 'VisitorCard',
    render: (record: TableRow) => (record['VisitorCard'] as any)?.CardDesc ?? ''
  },
  { 
    field: 'VisitorCompany', 
    label: 'Ziyaretçi Firma', 
    text: 'Ziyaretçi Firma',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'VisitorPhone', 
    label: 'Ziyaretçi Telefon', 
    text: 'Ziyaretçi Telefon',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    searchable: false,
    resizable: true,
    joinTable: 'VisitorEmployee',
    render: (record: TableRow) => {
      const visitor = record['VisitorEmployee'];
      if (visitor) {
        return visitor['MobilePhone1'] || visitor['MobilePhone2'] || visitor['HomePhone'] || visitor['CompanyPhone'] || '';
      }
      return '';
    }
  },
  { 
    field: 'VisitorEmail', 
    label: 'Ziyaretçi Email', 
    text: 'Ziyaretçi Email',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    searchable: false,
    resizable: true,
    joinTable: 'VisitorEmployee',
    render: (record: TableRow) => {
      const visitor = record['VisitorEmployee'];
      return visitor?.['Mail'] || '';
    }
  },
  // Ziyaret Edilen group (4 columns)
  { 
    field: 'VisitedCompany', 
    label: 'Ziyaret Edilen Firma', 
    text: 'Ziyaret Edilen Firma',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'VisitedEmployee.Name', 
    label: 'Ziyaret Edilen Kişi Adı', 
    text: 'Ziyaret Edilen Kişi Adı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    searchable: 'text' as ColumnType,
    resizable: true,
    joinTable: 'VisitedEmployee',
    render: (record: TableRow) => (record['VisitedEmployee'] as any)?.Name ?? ''
  },
  { 
    field: 'VisitedEmployee.SurName', 
    label: 'Ziyaret Edilen Kişi Soyadı', 
    text: 'Ziyaret Edilen Kişi Soyadı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    searchable: 'text' as ColumnType,
    resizable: true,
    joinTable: 'VisitedEmployee',
    render: (record: TableRow) => (record['VisitedEmployee'] as any)?.SurName ?? ''
  },
  { 
    field: 'VisitedPhone', 
    label: 'Ziyaret Edilen Telefon', 
    text: 'Ziyaret Edilen Telefon',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    searchable: false,
    resizable: true,
    joinTable: 'VisitedEmployee',
    render: (record: TableRow) => {
      const visited = record['VisitedEmployee'];
      if (visited) {
        return visited['MobilePhone1'] || visited['MobilePhone2'] || visited['HomePhone'] || visited['CompanyPhone'] || '';
      }
      return '';
    }
  },
  { 
    field: 'VisitedEmail', 
    label: 'Ziyaret Edilen Email', 
    text: 'Ziyaret Edilen Email',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    searchable: false,
    resizable: true,
    joinTable: 'VisitedEmployee',
    render: (record: TableRow) => {
      const visited = record['VisitedEmployee'];
      return visited?.['Mail'] || '';
    }
  },
  // Diğer group (includes Created Employee)
  { 
    field: 'CreatedEmployee.Name', 
    label: 'Oluşturan Adı', 
    text: 'Oluşturan Adı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    searchable: 'text' as ColumnType,
    resizable: true,
    joinTable: 'CreatedEmployee',
    render: (record: TableRow) => (record['CreatedEmployee'] as any)?.Name ?? ''
  },
  { 
    field: 'CreatedEmployee.SurName', 
    label: 'Oluşturan Soyadı', 
    text: 'Oluşturan Soyadı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    searchable: 'text' as ColumnType,
    resizable: true,
    joinTable: 'CreatedEmployee',
    render: (record: TableRow) => (record['CreatedEmployee'] as any)?.SurName ?? ''
  },
  { 
    field: 'ID', 
    label: 'ID', 
    text: 'ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'Description', 
    label: 'Açıklama', 
    text: 'Açıklama',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '300px', 
    size: '300px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'AccessGroupName', 
    label: 'Erişim Grubu', 
    text: 'Erişim Grubu',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'InDate', 
    label: 'Giriş Tarihi', 
    text: 'Giriş Tarihi',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '180px', 
    size: '180px',
    searchable: 'datetime',
    resizable: true
  },
  { 
    field: 'OutDate', 
    label: 'Çıkış Tarihi', 
    text: 'Çıkış Tarihi',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '180px', 
    size: '180px',
    searchable: 'datetime',
    resizable: true
  },
  { 
    field: 'TerminalDetails', 
    label: 'Terminal Detayları', 
    text: 'Terminal Detayları',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true
  },
];
