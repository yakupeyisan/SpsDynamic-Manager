// ErrorLogs table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  { 
    field: 'ID', 
    label: 'ID', 
    text: 'ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true,
    align: 'right'
  },
  { 
    field: 'Title', 
    label: 'Başlık', 
    text: 'Başlık',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '300px', 
    size: '300px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'Msg', 
    label: 'Mesaj', 
    text: 'Mesaj',
    type: 'textarea' as ColumnType, 
    sortable: false, 
    width: '500px', 
    size: '500px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'RecordTime', 
    label: 'Kayıt Zamanı', 
    text: 'Kayıt Zamanı',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '180px', 
    size: '180px',
    min: 20,
    searchable: 'datetime' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const date = record['RecordTime'];
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
  }
];
