// LocationBasedDailyReports table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  { 
    field: 'Date', 
    label: 'Tarih', 
    text: 'Tarih',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'datetime' as ColumnType,
    resizable: true,
    hidden: false, // Show in table
    render: (record: TableRow) => {
      if (!record['Date']) return '';
      const date = record['Date'];
      if (date instanceof Date || (typeof date === 'string' && date.length > 0)) {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toLocaleString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        }
      }
      return String(date || '');
    }
  },
  { 
    field: 'Location', 
    label: 'Konum', 
    text: 'Konum',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'Subscription', 
    label: 'Abonelik', 
    text: 'Abonelik',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    align: 'right'
  },
  { 
    field: 'FirstPass', 
    label: 'İlk Geçiş', 
    text: 'İlk Geçiş',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    align: 'right'
  },
  { 
    field: 'SecondPass', 
    label: 'İkinci Geçiş', 
    text: 'İkinci Geçiş',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    align: 'right'
  },
  { 
    field: 'TotalPass', 
    label: 'Toplam Geçiş', 
    text: 'Toplam Geçiş',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    align: 'right'
  }
];
