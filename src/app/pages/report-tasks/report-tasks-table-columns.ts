// ReportTasks table columns configuration
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
    searchable: 'int' as ColumnType,
    resizable: true,
    align: 'right',
  },
  {
    field: 'ReportId',
    label: 'Rapor ID',
    text: 'Rapor ID',
    type: 'int' as ColumnType,
    sortable: true,
    width: '100px',
    size: '100px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true,
    align: 'right',
  },
  {
    // If backend returns joined report object, this will show report name
    field: 'Report.Name',
    label: 'Rapor',
    text: 'Rapor',
    type: 'text' as ColumnType,
    sortable: true,
    width: '220px',
    size: '220px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
  },
  {
    field: 'Name',
    label: 'Görev Adı',
    text: 'Görev Adı',
    type: 'text' as ColumnType,
    sortable: true,
    width: '220px',
    size: '220px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
  },
  {
    field: 'Params',
    label: 'Parametreler',
    text: 'Parametreler',
    type: 'textarea' as ColumnType,
    sortable: false,
    width: '420px',
    size: '420px',
    min: 20,
    searchable: false,
    resizable: true,
    render: (record: TableRow) => {
      const raw = record['Params'];
      if (raw == null) return '';
      const text = String(raw);
      return text.length > 160 ? `${text.slice(0, 160)}…` : text;
    },
  },
  {
    field: 'CreatedAt',
    label: 'Oluşturulma',
    text: 'Oluşturulma',
    type: 'datetime' as ColumnType,
    sortable: true,
    width: '170px',
    size: '170px',
    min: 20,
    searchable: 'datetime' as ColumnType,
    resizable: true,
  },
  {
    field: 'UpdatedAt',
    label: 'Güncellenme',
    text: 'Güncellenme',
    type: 'datetime' as ColumnType,
    sortable: true,
    width: '170px',
    size: '170px',
    min: 20,
    searchable: 'datetime' as ColumnType,
    resizable: true,
  },
];

