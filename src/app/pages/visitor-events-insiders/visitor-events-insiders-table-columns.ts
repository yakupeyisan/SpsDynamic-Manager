// VisitorEventsInsiders table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

function safeParseTerminalDetails(value: any): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return '';
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed.join(', ');
      return String(parsed ?? '');
    } catch {
      return s;
    }
  }
  return String(value);
}

export const tableColumns: TableColumn[] = [
  { field: 'ID', label: 'ID', text: 'ID', type: 'int' as ColumnType, sortable: true, width: '80px', size: '80px', searchable: 'int', resizable: true },
  { field: 'InDate', label: 'Giriş', text: 'Giriş', type: 'datetime' as ColumnType, sortable: true, width: '180px', size: '180px', searchable: 'datetime', resizable: true },
  { field: 'Name', label: 'Adı', text: 'Adı', type: 'text' as ColumnType, sortable: true, width: '140px', size: '140px', searchable: 'text', resizable: true },
  { field: 'SurName', label: 'Soyad', text: 'Soyad', type: 'text' as ColumnType, sortable: true, width: '140px', size: '140px', searchable: 'text', resizable: true },
  { field: 'CardDesc', label: 'Kart Açıklaması', text: 'Kart Açıklaması', type: 'text' as ColumnType, sortable: true, width: '180px', size: '180px', searchable: 'text', resizable: true },
  { field: 'VisitorCompany', label: 'Ziyaretçi Firma', text: 'Ziyaretçi Firma', type: 'text' as ColumnType, sortable: true, width: '180px', size: '180px', searchable: 'text', resizable: true },
  { field: 'VisitedFullName', label: 'Ziyaret Edilen Kişi', text: 'Ziyaret Edilen Kişi', type: 'text' as ColumnType, sortable: true, width: '200px', size: '200px', searchable: 'text', resizable: true },
  { field: 'VisitedCompany', label: 'Ziyaret Edilen Firma', text: 'Ziyaret Edilen Firma', type: 'text' as ColumnType, sortable: true, width: '180px', size: '180px', searchable: 'text', resizable: true },
  { field: 'Description', label: 'Açıklama', text: 'Açıklama', type: 'text' as ColumnType, sortable: true, width: '240px', size: '240px', searchable: 'text', resizable: true },
  { field: 'AccessGroupName', label: 'Yetki Adı', text: 'Yetki Adı', type: 'text' as ColumnType, sortable: true, width: '180px', size: '180px', searchable: 'text', resizable: true },
  { field: 'EmployeeID', label: 'Ziyaretçi No', text: 'Ziyaretçi No', type: 'int' as ColumnType, sortable: true, width: '120px', size: '120px', searchable: 'int', resizable: true },
  { field: 'VisitorCardID', label: 'Ziyaretçi Kartı', text: 'Ziyaretçi Kartı', type: 'int' as ColumnType, sortable: true, width: '140px', size: '140px', searchable: 'int', resizable: true },
  { field: 'VisitedEmployeeID', label: 'Ziyaret Edilen', text: 'Ziyaret Edilen', type: 'int' as ColumnType, sortable: true, width: '140px', size: '140px', searchable: 'int', resizable: true },
  {
    field: 'TerminalDetails',
    label: 'Geçebileceği Kapılar',
    text: 'Geçebileceği Kapılar',
    type: 'text' as ColumnType,
    sortable: false,
    width: '260px',
    size: '260px',
    searchable: false,
    resizable: true,
    render: (rec: TableRow) => safeParseTerminalDetails(rec['TerminalDetails'])
  }
];

