// TerminalLogs table columns configuration
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
    field: 'TerminalName', 
    label: 'Terminal Adı', 
    text: 'Terminal Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '250px', 
    size: '250px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'TerminalSerial', 
    label: 'Terminal Seri No', 
    text: 'Terminal Seri No',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'Txt', 
    label: 'Log Metni', 
    text: 'Log Metni',
    type: 'textarea' as ColumnType, 
    sortable: false, 
    width: '400px', 
    size: '400px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'LogTime', 
    label: 'Log Zamanı', 
    text: 'Log Zamanı',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '180px', 
    size: '180px',
    min: 20,
    searchable: 'datetime' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const date = record['LogTime'];
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
    field: 'EmployeeID', 
    label: 'Çalışan ID', 
    text: 'Çalışan ID',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  }
];
