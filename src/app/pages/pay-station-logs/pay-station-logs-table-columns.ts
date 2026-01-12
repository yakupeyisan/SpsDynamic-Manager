// PayStationLogs table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  { 
    field: 'Id', 
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
    field: 'EmployeeID', 
    label: 'Çalışan ID', 
    text: 'Çalışan ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true,
    align: 'right',
    hidden: true
  },
  { 
    field: 'Employee', 
    searchField: 'EmployeeID',
    label: 'Çalışan', 
    text: 'Çalışan',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '250px', 
    size: '250px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true,
    joinTable: 'Employee',
    render: (record: TableRow) => {
      const employee = record['Employee'];
      if (employee) {
        const name = employee['Name'] || '';
        const surname = employee['SurName'] || '';
        return `${name} ${surname}`.trim() || employee['IdentificationNumber'] || '';
      }
      return record['EmployeeID'] || '';
    }
  },
  { 
    field: 'PayStationId', 
    label: 'Otomat ID', 
    text: 'Otomat ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true,
    align: 'right',
    hidden: true
  },
  { 
    field: 'PayStation', 
    searchField: 'PayStationId',
    label: 'Otomat', 
    text: 'Otomat',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true,
    joinTable: 'PayStation',
    render: (record: TableRow) => {
      const payStation = record['PayStation'];
      if (payStation) {
        return payStation['Name'] || payStation['PayStationName'] || '';
      }
      return record['PayStationId'] || '';
    }
  },
  { 
    field: 'Amount', 
    label: 'Tutar', 
    text: 'Tutar',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'float' as ColumnType,
    resizable: true,
    align: 'right',
    render: (record: TableRow) => {
      const amount = record['Amount'];
      if (amount !== undefined && amount !== null) {
        return Number(amount).toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' ₺';
      }
      return '0,00 ₺';
    }
  },
  { 
    field: 'Description', 
    label: 'Açıklama', 
    text: 'Açıklama',
    type: 'textarea' as ColumnType, 
    sortable: false, 
    width: '400px', 
    size: '400px',
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
