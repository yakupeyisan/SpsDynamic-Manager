// TerminalTariffs table columns configuration
import { TableColumn, ColumnType } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  // Genel grup
  { 
    field: 'TariffID', 
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
    field: 'ProjectID', 
    label: 'Proje ID', 
    text: 'Proje ID',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'TerminalName', 
    label: 'Terminal', 
    text: 'Terminal',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    searchable: false,
    resizable: true,
    render: (record: any) => record.Terminal?.ReaderName || record.Terminal?.TerminalName || record.Terminal?.Name || '',
    joinTable: 'Terminal'
  },
  { 
    field: 'CafeteriaGroupName', 
    label: 'Kafeterya Grubu', 
    text: 'Kafeterya Grubu',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    searchable: false,
    resizable: true,
    render: (record: any) => record.CafeteriaGroup?.CafeteriaGroupName || record.CafeteriaGroup?.Name || '',
    joinTable: 'CafeteriaGroup'
  },
  // Öğün 1 grup
  { 
    field: 'App1FirstPassFee', 
    label: 'İlk Geçiş', 
    text: 'İlk Geçiş',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'float',
    resizable: true,
    render: (record: any) => {
      const value = record.App1FirstPassFee;
      if (value == null || value === undefined || value === '') return '';
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return '';
      const dividedValue = numValue / 100;
      return dividedValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  },
  { 
    field: 'App1SecondPassFee', 
    label: 'İkinci Geçiş', 
    text: 'İkinci Geçiş',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '130px', 
    size: '130px',
    searchable: 'float',
    resizable: true,
    render: (record: any) => {
      const value = record.App1SecondPassFee;
      if (value == null || value === undefined || value === '') return '';
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return '';
      const dividedValue = numValue / 100;
      return dividedValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  },
  { 
    field: 'App1PassLimitBalance', 
    label: 'Limit Bakiye', 
    text: 'Limit Bakiye',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '130px', 
    size: '130px',
    searchable: 'float',
    resizable: true,
    render: (record: any) => {
      const value = record.App1PassLimitBalance;
      if (value === -1 || value === '-1') return 'Limitsiz';
      if (value === 0 || value === '0' || value === null || value === undefined) return 'Kapalı';
      return value;
    }
  },
  { 
    field: 'App1PassLimitCredit', 
    label: 'Limit Kredi', 
    text: 'Limit Kredi',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'float',
    resizable: true,
    render: (record: any) => {
      const value = record.App1PassLimitCredit;
      if (value === -1 || value === '-1') return 'Limitsiz';
      if (value === 0 || value === '0' || value === null || value === undefined) return 'Kapalı';
      return value;
    }
  },
  // Öğün 2 grup
  { 
    field: 'App2FirstPassFee', 
    label: 'İlk Geçiş', 
    text: 'İlk Geçiş',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'float',
    resizable: true,
    render: (record: any) => {
      const value = record.App2FirstPassFee;
      if (value == null || value === undefined || value === '') return '';
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return '';
      const dividedValue = numValue / 100;
      return dividedValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  },
  { 
    field: 'App2SecondPassFee', 
    label: 'İkinci Geçiş', 
    text: 'İkinci Geçiş',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '130px', 
    size: '130px',
    searchable: 'float',
    resizable: true,
    render: (record: any) => {
      const value = record.App2SecondPassFee;
      if (value == null || value === undefined || value === '') return '';
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return '';
      const dividedValue = numValue / 100;
      return dividedValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  },
  { 
    field: 'App2PassLimitBalance', 
    label: 'Limit Bakiye', 
    text: 'Limit Bakiye',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '130px', 
    size: '130px',
    searchable: 'float',
    resizable: true,
    render: (record: any) => {
      const value = record.App2PassLimitBalance;
      if (value === -1 || value === '-1') return 'Limitsiz';
      if (value === 0 || value === '0' || value === null || value === undefined) return 'Kapalı';
      return value;
    }
  },
  { 
    field: 'App2PassLimitCredit', 
    label: 'Limit Kredi', 
    text: 'Limit Kredi',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'float',
    resizable: true,
    render: (record: any) => {
      const value = record.App2PassLimitCredit;
      if (value === -1 || value === '-1') return 'Limitsiz';
      if (value === 0 || value === '0' || value === null || value === undefined) return 'Kapalı';
      return value;
    }
  },
  // Öğün 3 grup
  { 
    field: 'App3FirstPassFee', 
    label: 'İlk Geçiş', 
    text: 'İlk Geçiş',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'float',
    resizable: true,
    render: (record: any) => {
      const value = record.App3FirstPassFee;
      if (value == null || value === undefined || value === '') return '';
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return '';
      const dividedValue = numValue / 100;
      return dividedValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  },
  { 
    field: 'App3SecondPassFee', 
    label: 'İkinci Geçiş', 
    text: 'İkinci Geçiş',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '130px', 
    size: '130px',
    searchable: 'float',
    resizable: true,
    render: (record: any) => {
      const value = record.App3SecondPassFee;
      if (value == null || value === undefined || value === '') return '';
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return '';
      const dividedValue = numValue / 100;
      return dividedValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  },
  { 
    field: 'App3PassLimitBalance', 
    label: 'Limit Bakiye', 
    text: 'Limit Bakiye',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '130px', 
    size: '130px',
    searchable: 'float',
    resizable: true,
    render: (record: any) => {
      const value = record.App3PassLimitBalance;
      if (value === -1 || value === '-1') return 'Limitsiz';
      if (value === 0 || value === '0' || value === null || value === undefined) return 'Kapalı';
      return value;
    }
  },
  { 
    field: 'App3PassLimitCredit', 
    label: 'Limit Kredi', 
    text: 'Limit Kredi',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'float',
    resizable: true,
    render: (record: any) => {
      const value = record.App3PassLimitCredit;
      if (value === -1 || value === '-1') return 'Limitsiz';
      if (value === 0 || value === '0' || value === null || value === undefined) return 'Kapalı';
      return value;
    }
  },
  // Öğün 4 grup
  { 
    field: 'App4FirstPassFee', 
    label: 'İlk Geçiş', 
    text: 'İlk Geçiş',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'float',
    resizable: true,
    render: (record: any) => {
      const value = record.App4FirstPassFee;
      if (value == null || value === undefined || value === '') return '';
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return '';
      const dividedValue = numValue / 100;
      return dividedValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  },
  { 
    field: 'App4SecondPassFee', 
    label: 'İkinci Geçiş', 
    text: 'İkinci Geçiş',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '130px', 
    size: '130px',
    searchable: 'float',
    resizable: true,
    render: (record: any) => {
      const value = record.App4SecondPassFee;
      if (value == null || value === undefined || value === '') return '';
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return '';
      const dividedValue = numValue / 100;
      return dividedValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  },
  { 
    field: 'App4PassLimitBalance', 
    label: 'Limit Bakiye', 
    text: 'Limit Bakiye',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '130px', 
    size: '130px',
    searchable: 'float',
    resizable: true,
    render: (record: any) => {
      const value = record.App4PassLimitBalance;
      if (value === -1 || value === '-1') return 'Limitsiz';
      if (value === 0 || value === '0' || value === null || value === undefined) return 'Kapalı';
      return value;
    }
  },
  { 
    field: 'App4PassLimitCredit', 
    label: 'Limit Kredi', 
    text: 'Limit Kredi',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'float',
    resizable: true,
    render: (record: any) => {
      const value = record.App4PassLimitCredit;
      if (value === -1 || value === '-1') return 'Limitsiz';
      if (value === 0 || value === '0' || value === null || value === undefined) return 'Kapalı';
      return value;
    }
  }
];
