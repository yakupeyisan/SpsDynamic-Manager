// PaymentTypes table columns configuration
import { TableColumn, ColumnType } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  { 
    field: 'Id', 
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
    field: 'Name', 
    label: 'Ad', 
    text: 'Ad',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '300px', 
    size: '300px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'Filter', 
    label: 'Filtre', 
    text: 'Filtre',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'LoginRequire', 
    label: 'Giriş Gerekli', 
    text: 'Giriş Gerekli',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'Amount', 
    label: 'Tutar', 
    text: 'Tutar',
    type: 'currency' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'float',
    resizable: true,
    currencyPrefix: '',
    currencySuffix: '₺',
    currencyPrecision: 2
  },
  { 
    field: 'PayMethod', 
    label: 'Ödeme Yöntemi', 
    text: 'Ödeme Yöntemi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true
  }
];
