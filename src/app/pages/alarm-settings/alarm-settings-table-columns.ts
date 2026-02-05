// AlarmSettings table columns configuration (Alarms entity)
import { TableColumn, ColumnType } from 'src/app/components/data-table/data-table.component';

const sourceTypeOptions = [
  { label: 'Kapı', value: 'DOOR' },
  { label: 'Input', value: 'INPUT' },
  { label: 'Output', value: 'OUTPUT' },
  { label: 'Okuyucu', value: 'READER' }
];

const eventResultOptions = [
  { label: 'Başarılı', value: 'true' },
  { label: 'Başarısız', value: 'false' }
];

const colorOptions: { label: string; value: string }[] = [
  { label: 'Transparent', value: '' },
  { label: 'Yeşil', value: '#22c55e' },
  { label: 'Kırmızı', value: '#ef4444' },
  { label: 'Mavi', value: '#3b82f6' },
  { label: 'Sarı', value: '#eab308' }
];

export const tableColumns: TableColumn[] = [
  {
    field: 'AlarmID',
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
    field: 'SourceType',
    label: 'Kaynak Tipi',
    text: 'Kaynak Tipi',
    type: 'list' as ColumnType,
    sortable: true,
    width: '120px',
    size: '120px',
    searchable: 'text',
    resizable: true,
    options: sourceTypeOptions
  },
  {
    field: 'SourceID',
    label: 'Kaynak',
    text: 'Kaynak',
    type: 'int' as ColumnType,
    sortable: true,
    width: '100px',
    size: '100px',
    searchable: 'int',
    resizable: true
  },
  {
    field: 'SourceName',
    label: 'Kaynak Adı',
    text: 'Kaynak Adı',
    type: 'text' as ColumnType,
    sortable: true,
    width: '200px',
    size: '200px',
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
    width: '140px',
    size: '140px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'Employee.SurName',
    label: 'Personel Soyad',
    text: 'Personel Soyad',
    type: 'text' as ColumnType,
    sortable: true,
    width: '140px',
    size: '140px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'EventResult',
    label: 'Olay Sonucu',
    text: 'Olay Sonucu',
    type: 'list' as ColumnType,
    sortable: true,
    width: '120px',
    size: '120px',
    searchable: 'text',
    resizable: true,
    options: eventResultOptions,
    render: (record: any) => {
      const v = record?.EventResult;
      if (v === 1 || v === '1' || v === true || v === 'true') return 'Başarılı';
      if (v === 0 || v === '0' || v === false || v === 'false') return 'Başarısız';
      return v != null ? String(v) : '';
    }
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
    field: 'Color',
    label: 'Renk',
    text: 'Renk',
    type: 'list' as ColumnType,
    sortable: true,
    width: '100px',
    size: '100px',
    searchable: 'text',
    resizable: true,
    options: colorOptions,
    render: (record: any) => {
      const hex = record?.Color;
      if (hex == null || hex === '') return '';
      const opt = colorOptions.find(o => o.value === hex);
      return opt ? opt.label : hex;
    }
  },
  {
    field: 'SoundFile',
    label: 'Ses Dosyası',
    text: 'Ses Dosyası',
    type: 'text' as ColumnType,
    sortable: true,
    width: '150px',
    size: '150px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'isPopUp',
    label: 'Popup',
    text: 'Popup',
    type: 'checkbox' as ColumnType,
    sortable: true,
    width: '80px',
    size: '80px',
    searchable: true,
    resizable: true
  },
  {
    field: 'TimeZoneID',
    label: 'Zaman Dilimi ID',
    text: 'Zaman Dilimi ID',
    type: 'int' as ColumnType,
    sortable: true,
    width: '100px',
    size: '100px',
    searchable: 'int',
    resizable: true
  },
  {
    field: 'TimeZone.TimeZoneName',
    label: 'Zaman Dilimi',
    text: 'Zaman Dilimi',
    type: 'text' as ColumnType,
    sortable: true,
    width: '140px',
    size: '140px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'SchedulerTaskId',
    label: 'Görev ID',
    text: 'Görev ID',
    type: 'int' as ColumnType,
    sortable: true,
    width: '90px',
    size: '90px',
    searchable: 'int',
    resizable: true
  },
  {
    field: 'TaskScheduler.Name',
    label: 'Görev',
    text: 'Görev',
    type: 'text' as ColumnType,
    sortable: true,
    width: '160px',
    size: '160px',
    searchable: 'text',
    resizable: true
  }
];
