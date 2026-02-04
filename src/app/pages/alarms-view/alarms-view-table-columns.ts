// AlarmsView (AlarmEvent) table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

function formatDateTime(value: any): string {
  if (value == null || value === '') return '';
  const d = typeof value === 'string' || value instanceof Date ? new Date(value) : null;
  if (!d || isNaN(d.getTime())) return String(value ?? '');
  return d.toLocaleString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export const tableColumns: TableColumn[] = [
  {
    field: 'AlarmEventID',
    label: 'ID',
    text: 'ID',
    type: 'int' as ColumnType,
    sortable: true,
    width: '90px',
    size: '90px',
    searchable: 'int',
    resizable: true
  },
  {
    field: 'AlarmTime',
    label: 'Alarm Zamanı',
    text: 'Alarm Zamanı',
    type: 'datetime' as ColumnType,
    sortable: true,
    width: '150px',
    size: '150px',
    searchable: 'datetime',
    resizable: true,
    render: (record: TableRow) => formatDateTime(record['AlarmTime'])
  },
  {
    field: 'SourceType',
    label: 'Kaynak Tipi',
    text: 'Kaynak Tipi',
    type: 'text' as ColumnType,
    sortable: true,
    width: '110px',
    size: '110px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'SourceName',
    label: 'Kaynak Adı',
    text: 'Kaynak Adı',
    type: 'text' as ColumnType,
    sortable: true,
    width: '180px',
    size: '180px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'EmployeeID',
    label: 'Personel ID',
    text: 'Personel ID',
    type: 'int' as ColumnType,
    sortable: true,
    width: '100px',
    size: '100px',
    searchable: 'int',
    resizable: true
  },
  {
    field: 'Employee.Name',
    label: 'Personel Ad',
    text: 'Personel Ad',
    type: 'text' as ColumnType,
    sortable: true,
    width: '120px',
    size: '120px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'Employee.SurName',
    label: 'Personel Soyad',
    text: 'Personel Soyad',
    type: 'text' as ColumnType,
    sortable: true,
    width: '120px',
    size: '120px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'Description',
    label: 'Açıklama',
    text: 'Açıklama',
    type: 'text' as ColumnType,
    sortable: true,
    width: '200px',
    size: '200px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'SoundFile',
    label: 'Ses Dosyası',
    text: 'Ses Dosyası',
    type: 'text' as ColumnType,
    sortable: true,
    width: '140px',
    size: '140px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'isPopUp',
    label: 'Popup',
    text: 'Popup',
    type: 'boolean' as ColumnType,
    sortable: true,
    width: '80px',
    size: '80px',
    searchable: true,
    resizable: true,
    render: (record: TableRow) => (record['isPopUp'] ? 'Evet' : 'Hayır')
  },
  {
    field: 'ApprovedTime',
    label: 'Onay Zamanı',
    text: 'Onay Zamanı',
    type: 'datetime' as ColumnType,
    sortable: true,
    width: '150px',
    size: '150px',
    searchable: 'datetime',
    resizable: true,
    render: (record: TableRow) => formatDateTime(record['ApprovedTime'])
  },
  {
    field: 'ApprovedEmployeeID',
    label: 'Onaylayan ID',
    text: 'Onaylayan ID',
    type: 'int' as ColumnType,
    sortable: true,
    width: '100px',
    size: '100px',
    searchable: 'int',
    resizable: true
  },
  {
    field: 'ApprovedEmployee.Name',
    label: 'Onaylayan',
    text: 'Onaylayan',
    type: 'text' as ColumnType,
    sortable: true,
    width: '140px',
    size: '140px',
    searchable: 'text',
    resizable: true,
    render: (record: TableRow) => {
      const emp = record['ApprovedEmployee'];
      if (!emp) return '';
      return [emp['Name'], emp['SurName']].filter(Boolean).join(' ').trim() || '';
    }
  },
  {
    field: 'ApprovedNote',
    label: 'Onay Notu',
    text: 'Onay Notu',
    type: 'text' as ColumnType,
    sortable: true,
    width: '180px',
    size: '180px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'CreatedAt',
    label: 'Oluşturulma',
    text: 'Oluşturulma',
    type: 'datetime' as ColumnType,
    sortable: true,
    width: '150px',
    size: '150px',
    searchable: 'datetime',
    resizable: true,
    render: (record: TableRow) => formatDateTime(record['CreatedAt'])
  }
];
