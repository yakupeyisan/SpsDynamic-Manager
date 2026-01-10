// SmsTransactions table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  { 
    field: 'ID', 
    label: 'ID', 
    text: 'ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    min: 20,
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'EmployeeName', 
    label: 'Personel Adı', 
    text: 'Personel Adı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: false,
    resizable: true,
    render: (record: TableRow) => {
      const employee = record['Employee'];
      if (employee) {
        return `${employee['Name'] || ''} ${employee['SurName'] || ''}`.trim();
      }
      return '';
    }
  },
  { 
    field: 'SmsSettingName', 
    label: 'SMS Ayarı', 
    text: 'SMS Ayarı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: false,
    resizable: true,
    render: (record: TableRow) => {
      const smsSetting = record['SmsSetting'];
      return smsSetting?.['Name'] || '';
    }
  },
  { 
    field: 'Type', 
    label: 'Tip', 
    text: 'Tip',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'Number', 
    label: 'Telefon Numarası', 
    text: 'Telefon Numarası',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'Message', 
    label: 'Mesaj', 
    text: 'Mesaj',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '300px', 
    size: '300px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'Result', 
    label: 'Sonuç', 
    text: 'Sonuç',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'IsSend', 
    label: 'Gönderildi', 
    text: 'Gönderildi',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    min: 20,
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'SendDate', 
    label: 'Gönderim Tarihi', 
    text: 'Gönderim Tarihi',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'datetime',
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
    min: 20,
    searchable: 'datetime',
    resizable: true
  },
  { 
    field: 'UpdatedAt', 
    label: 'Güncellenme', 
    text: 'Güncellenme',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'datetime',
    resizable: true
  }
];
