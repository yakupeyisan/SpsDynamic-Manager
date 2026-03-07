// GroupBasedCafeteriaUsedCountReports table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  {
    field: 'CafeteriaGroupName',
    label: 'Kafeterya Grubu',
    text: 'Kafeterya Grubu',
    type: 'text' as ColumnType,
    sortable: true,
    width: '220px',
    size: '220px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
  },
  {
    field: 'Day',
    label: 'Gün',
    text: 'Gün',
    type: 'date' as ColumnType,
    sortable: true,
    width: '120px',
    size: '120px',
    min: 20,
    searchable: 'date' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const raw = record['Day'];
      if (raw == null) return '';
      const date = new Date(raw);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit' });
      }
      return String(raw ?? '');
    },
  },
  {
    field: 'DayName',
    label: 'Gün Adı',
    text: 'Gün Adı',
    type: 'text' as ColumnType,
    sortable: true,
    width: '120px',
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
  },
  {
    field: 'NumberOfPass',
    label: 'Geçiş Sayısı',
    text: 'Geçiş Sayısı',
    type: 'int' as ColumnType,
    sortable: true,
    width: '120px',
    size: '120px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true,
  },
];
