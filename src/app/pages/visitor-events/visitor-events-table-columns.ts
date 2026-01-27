// VisitorEvents table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  // Ziyaretçi group (3 columns)
  { 
    field: 'VisitorEmployeeID', 
    label: 'Ziyaretçi', 
    text: 'Ziyaretçi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true,
    joinTable: 'VisitorEmployee',
    render: (record: TableRow) => {
      const visitor = record['VisitorEmployee'];
      if (visitor) {
        const name = visitor['Name'] || '';
        const surname = visitor['SurName'] || '';
        return `${name} ${surname}`.trim() || visitor['IdentificationNumber'] || record['VisitorEmployeeID'] || '';
      }
      return record['VisitorEmployeeID'] || '';
    }
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
    field: 'VisitedEmployeeID', 
    label: 'Ziyaret Edilen Kişi', 
    text: 'Ziyaret Edilen Kişi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true,
    joinTable: 'VisitedEmployee',
    render: (record: TableRow) => {
      const visited = record['VisitedEmployee'];
      if (visited) {
        const name = visited['Name'] || '';
        const surname = visited['SurName'] || '';
        return `${name} ${surname}`.trim() || visited['IdentificationNumber'] || record['VisitedEmployeeID'] || '';
      }
      return record['VisitedEmployeeID'] || '';
    }
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
  // Diğer group (6 columns)
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
  }
];
