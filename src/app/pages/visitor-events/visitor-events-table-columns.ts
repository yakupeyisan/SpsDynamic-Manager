// VisitorEvents table columns configuration
import { TableColumn, ColumnType } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
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
    field: 'VisitorEmployeeID', 
    label: 'Ziyaretçi', 
    text: 'Ziyaretçi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true,
    joinTable: 'VisitorEmployee'
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
    joinTable: 'VisitedEmployee'
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
