// Logs table columns configuration
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
    align: 'right'
  },
  { 
    field: 'ProcessTime', 
    label: 'İşlem Zamanı', 
    text: 'İşlem Zamanı',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '180px', 
    size: '180px',
    min: 20,
    searchable: 'datetime' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const date = record['ProcessTime'];
      if (date) {
        return new Date(date).toLocaleString('tr-TR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
      return '';
    }
  },
  { 
    field: 'ReferanceTable', 
    label: 'Referans Tablo', 
    text: 'Referans Tablo',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'ReferanceId', 
    label: 'Referans ID', 
    text: 'Referans ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true,
    align: 'right'
  },
  { 
    field: 'Type', 
    label: 'Tip', 
    text: 'Tip',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'EmployeeId', 
    label: 'Çalışan ID', 
    text: 'Çalışan ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true,
    align: 'right'
  },
  { 
    field: 'FullName', 
    label: 'Ad Soyad', 
    text: 'Ad Soyad',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'Description', 
    label: 'Açıklama', 
    text: 'Açıklama',
    type: 'textarea' as ColumnType, 
    sortable: false, 
    width: '300px', 
    size: '300px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'Location', 
    label: 'Konum', 
    text: 'Konum',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'LoginFullName', 
    label: 'Giriş Yapan Ad Soyad', 
    text: 'Giriş Yapan Ad Soyad',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'LoginId', 
    label: 'Giriş ID', 
    text: 'Giriş ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true,
    align: 'right'
  },
  { 
    field: 'LoginType', 
    label: 'Giriş Tipi', 
    text: 'Giriş Tipi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'CreatedAt', 
    label: 'Oluşturulma Tarihi', 
    text: 'Oluşturulma Tarihi',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '180px', 
    size: '180px',
    min: 20,
    searchable: 'datetime' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const date = record['CreatedAt'];
      if (date) {
        return new Date(date).toLocaleString('tr-TR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
      return '';
    },
  },
  { 
    field: 'Data', 
    label: 'Veri', 
    text: 'Veri',
    type: 'textarea' as ColumnType, 
    sortable: false, 
    width: '300px', 
    size: '300px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
];
