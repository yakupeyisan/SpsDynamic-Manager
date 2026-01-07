// CardWriteList table columns configuration
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
    field: 'TemplateName', 
    label: 'Şablon Adı', 
    text: 'Şablon Adı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    searchable: false,
    resizable: true,
    render: (record: any) => record.CardTemplate?.Name || record.CardTemplate?.TemplateName || '',
    joinTable: 'CardTemplate'
  },
  { 
    field: 'CardCode', 
    label: 'Kart Kodu', 
    text: 'Kart Kodu',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    searchable: false,
    resizable: true,
    render: (record: any) => record.Card?.CardCode || record.Card?.CardUID || '',
    joinTable: 'Card'
  },
  { 
    field: 'CardUID', 
    label: 'Kart UID', 
    text: 'Kart UID',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    searchable: false,
    resizable: true,
    render: (record: any) => record.Card?.CardUID || '',
    joinTable: 'Card'
  },
  { 
    field: 'EmployeeName', 
    label: 'Kişi Adı', 
    text: 'Kişi Adı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    searchable: false,
    resizable: true,
    render: (record: any) => {
      if (record.Card?.Employee) {
        return `${record.Card.Employee.Name || ''} ${record.Card.Employee.SurName || ''}`.trim() || record.Card.Employee.Name || record.Card.Employee.SurName || '';
      }
      return '';
    },
    joinTable: 'Card'
  },
  { 
    field: 'WritedAt', 
    label: 'Yazdırma Tarihi', 
    text: 'Yazdırma Tarihi',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '180px', 
    size: '180px',
    searchable: 'datetime',
    resizable: true
  },
  { 
    field: 'WritedUser', 
    label: 'Yazdıran Kullanıcı', 
    text: 'Yazdıran Kullanıcı',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'WritedData', 
    label: 'Yazdırılan Veri', 
    text: 'Yazdırılan Veri',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '300px', 
    size: '300px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'TemplateId', 
    label: 'Şablon ID', 
    text: 'Şablon ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'int',
    resizable: true,
    joinTable: 'CardTemplate'
  },
  { 
    field: 'CardId', 
    label: 'Kart ID', 
    text: 'Kart ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: 'int',
    resizable: true,
    joinTable: 'Card'
  },
  { 
    field: 'CreatedAt', 
    label: 'Oluşturma Tarihi', 
    text: 'Oluşturma Tarihi',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '180px', 
    size: '180px',
    searchable: 'datetime',
    resizable: true
  },
  { 
    field: 'UpdatedAt', 
    label: 'Güncelleme Tarihi', 
    text: 'Güncelleme Tarihi',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '180px', 
    size: '180px',
    searchable: 'datetime',
    resizable: true
  }
];
