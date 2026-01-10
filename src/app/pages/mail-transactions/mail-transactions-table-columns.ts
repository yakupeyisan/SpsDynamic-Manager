// MailTransactions table columns configuration
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
    field: 'MailSettingName', 
    label: 'Mail Ayarı', 
    text: 'Mail Ayarı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: false,
    resizable: true,
    render: (record: TableRow) => {
      const mailSetting = record['MailSetting'];
      return mailSetting?.['Name'] || '';
    }
  },
  { 
    field: 'MailAdress', 
    label: 'E-Mail Adresi', 
    text: 'E-Mail Adresi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'Title', 
    label: 'Konu', 
    text: 'Konu',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
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
    field: 'IsBulk', 
    label: 'Toplu Mail', 
    text: 'Toplu Mail',
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
    field: 'Response', 
    label: 'Yanıt', 
    text: 'Yanıt',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'Attachments', 
    label: 'Ekler', 
    text: 'Ekler',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text',
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
