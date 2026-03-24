// PdksStaff (Kadro) table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

function formatTimeCell(v: unknown): string {
  if (v == null || v === '') return '';
  const s = String(v).trim();
  const m = s.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return s;
  return `${m[1].padStart(2, '0')}:${m[2]}${m[3] != null ? ':' + m[3] : ''}`;
}

function timeColumn(
  field: string,
  label: string,
  text: string
): TableColumn {
  return {
    field,
    label,
    text,
    type: 'time' as ColumnType,
    sortable: true,
    width: '112px',
    size: '112px',
    min: 80,
    searchable: 'time',
    resizable: true,
    render: (record: TableRow) => formatTimeCell(record[field])
  };
}

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
    resizable: true,
    frozen: true
  },
  {
    field: 'Name',
    label: 'Kadro Adı',
    text: 'Kadro Adı',
    type: 'text' as ColumnType,
    sortable: true,
    width: '220px',
    size: '220px',
    searchable: 'text',
    resizable: true,
    frozen: true
  },
  {
    field: 'ProjectID',
    label: 'Proje ID',
    text: 'Proje ID',
    type: 'int' as ColumnType,
    sortable: true,
    width: '100px',
    size: '100px',
    searchable: 'int',
    resizable: true
  },
  timeColumn('MondayStartTime', 'Pzt Başl.', 'Pazartesi Başlangıç'),
  timeColumn('MondayEndTime', 'Pzt Bit.', 'Pazartesi Bitiş'),
  timeColumn('TuesdayStartTime', 'Sal Başl.', 'Salı Başlangıç'),
  timeColumn('TuesdayEndTime', 'Sal Bit.', 'Salı Bitiş'),
  timeColumn('WednesdayStartTime', 'Çar Başl.', 'Çarşamba Başlangıç'),
  timeColumn('WednesdayEndTime', 'Çar Bit.', 'Çarşamba Bitiş'),
  timeColumn('ThursdayStartTime', 'Per Başl.', 'Perşembe Başlangıç'),
  timeColumn('ThursdayEndTime', 'Per Bit.', 'Perşembe Bitiş'),
  timeColumn('FridayStartTime', 'Cum Başl.', 'Cuma Başlangıç'),
  timeColumn('FridayEndTime', 'Cum Bit.', 'Cuma Bitiş'),
  timeColumn('SaturdayStartTime', 'Cmt Başl.', 'Cumartesi Başlangıç'),
  timeColumn('SaturdayEndTime', 'Cmt Bit.', 'Cumartesi Bitiş'),
  timeColumn('SundayStartTime', 'Paz Başl.', 'Pazar Başlangıç'),
  timeColumn('SundayEndTime', 'Paz Bit.', 'Pazar Bitiş')
];
