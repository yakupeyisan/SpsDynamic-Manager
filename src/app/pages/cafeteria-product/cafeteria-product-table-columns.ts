// CafeteriaProduct table columns configuration
import { TableColumn, ColumnType } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  { 
    field: 'ProductID', 
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
    field: 'ProductBarcode', 
    label: 'Barkod', 
    text: 'Barkod',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'ProductName', 
    label: 'Ürün Adı', 
    text: 'Ürün Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '300px', 
    size: '300px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'ProductType', 
    label: 'Ürün Tipi', 
    text: 'Ürün Tipi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true,
    joinTable: 'CafeteriaProductType'
  },
  { 
    field: 'Price', 
    label: 'Fiyat', 
    text: 'Fiyat',
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
    field: 'ProductDescription', 
    label: 'Ürün Açıklaması', 
    text: 'Ürün Açıklaması',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '300px', 
    size: '300px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'ReturnPeriod', 
    label: 'İade Süresi', 
    text: 'İade Süresi',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'int',
    resizable: true
  }
];
